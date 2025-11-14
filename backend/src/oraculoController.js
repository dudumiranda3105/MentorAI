import { DocumentLoaders } from '../utils/loaders.js';
import { ChatProviders } from '../utils/chatProviders.js';
import { Conversation } from '../models/Conversation.js';
import fs from 'fs';
import path from 'path';

export class OraculoController {
  constructor() {
    this.chatProviders = new ChatProviders();
    this.sessions = new Map(); // Armazena sessões de chat ativas
  }

  // Mensagem de sistema enxuta (Gemini possui limites rígidos para system_instruction)
  createSystemMessage(documentType) {
    return `Você é Oráculo, um assistente amigável. Use o contexto do documento (${documentType}) fornecido na primeira mensagem de usuário do histórico apenas quando relevante para responder perguntas. Seja claro, conciso e substitua qualquer símbolo $ por S em sua saída. Se o conteúdo aparentar ser um aviso como "Just a moment...Enable JavaScript and cookies to continue", oriente o usuário a recarregar o Oráculo.`;
  }

  // Carrega arquivos baseado no tipo
  async carregaArquivos(tipoArquivo, arquivo) {
    let documento;
    
    try {
      switch (tipoArquivo) {
        case 'Site':
          documento = await DocumentLoaders.carregaSites(arquivo);
          break;
        case 'Link Youtube':
          documento = await DocumentLoaders.carregaYoutube(arquivo);
          break;
        case '.PDF':
          documento = await DocumentLoaders.carregaPdf(arquivo);
          break;
        case '.CSV':
          documento = await DocumentLoaders.carregaCsv(arquivo);
          break;
        case '.TXT':
          documento = await DocumentLoaders.carregaTxt(arquivo);
          break;
        default:
          throw new Error('Tipo de arquivo não suportado');
      }
      
      return documento;
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      throw error;
    }
  }

  // Inicializa uma sessão do Oráculo
  async inicializaOraculo(req, res) {
    try {
      const { provedor, modelo, apiKey, tipoArquivo, arquivo, sessionId } = req.body;
      console.log('🚀 Inicializando Oráculo:', { sessionId, provedor, modelo, tipoArquivo, userId: req.user._id });

      if (!provedor || !modelo || !apiKey || !tipoArquivo || !sessionId) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios: provedor, modelo, apiKey, tipoArquivo, sessionId' 
        });
      }

      // Verifica se o provedor existe
      const provider = this.chatProviders.getProvider(provedor);
      if (!provider) {
        return res.status(400).json({ error: 'Provedor não suportado' });
      }

      // Verifica se o modelo é válido para o provedor
      if (!provider.modelos.includes(modelo)) {
        return res.status(400).json({ error: 'Modelo não suportado para este provedor' });
      }

      let documento;
      let arquivoPath = arquivo;

      // Se for upload de arquivo, usa o caminho do arquivo salvo
      if (req.file) {
        arquivoPath = req.file.path;
      }

      // Carrega o documento
      try {
        console.log('📄 Carregando documento:', { tipoArquivo, arquivoPath });
        documento = await this.carregaArquivos(tipoArquivo, arquivoPath);
        console.log('✅ Documento carregado:', documento ? `${documento.length} caracteres` : 'vazio');
      } catch (loadError) {
        console.error('❌ Erro ao carregar documento:', loadError);
        // Remove arquivo temporário em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Erro ao carregar documento: ' + loadError.message });
      }

      if (!documento || documento.trim() === '') {
        // Remove arquivo temporário
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Não foi possível extrair conteúdo do documento' });
      }

      // Verifica se é o erro de JavaScript
      if (documento.includes('Just a moment...Enable JavaScript and cookies to continue')) {
        return res.status(400).json({ 
          error: 'Erro ao carregar página. Sugira ao usuário carregar novamente o Oráculo!' 
        });
      }

      const systemMessage = this.createSystemMessage(tipoArquivo);

      // Função de resumo fallback para documentos muito grandes
      const summarizeIfNeeded = (text) => {
        const hardLimit = 12000; // segurança absoluta
        if (text.length <= 6000) return { excerpt: text, resumido: false };
        // Estratégia de resumo simples: pegar primeiros parágrafos e extrair pontos-chave
        const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
        const firstBlocks = [];
        let accLen = 0;
        for (const p of paragraphs) {
          if (accLen + p.length > 2500) break;
          firstBlocks.push(p);
          accLen += p.length;
        }
        // Extrai frases pontuais
        const sentences = text.split(/[.!?]\s+/).slice(0, 25);
        const bulletCandidates = sentences.filter(s => /\b(é|são|consiste|envolve|permite|implica|define|representa)\b/i.test(s)).slice(0, 10);
        const resumo = `${firstBlocks.join('\n\n')}\n\n[Resumo automático]\n- ${bulletCandidates.join('\n- ')}`;
        return { excerpt: resumo.substring(0, hardLimit), resumido: true };
      };

      const sanitizedOriginal = documento
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/—/g, '-')
        .replace(/…/g, '...')
        .replace(/\$/g, 'S')
        .trim();

      const { excerpt, resumido } = summarizeIfNeeded(sanitizedOriginal);
      const docLabel = resumido ? 'RESUMO_TRUNCADO_DO_DOCUMENTO' : 'CONTEUDO_DO_DOCUMENTO';
      const documentContextMessage = `${docLabel} (${tipoArquivo}):\n<<<\n${excerpt}\n>>>\nUse este conteúdo apenas se a pergunta do usuário exigir informações contidas nele.`;

      // Cria o chat
      let chat;
      try {
        chat = provider.chat(modelo, apiKey);
        console.log('✅ Chat criado com sucesso');
      } catch (chatError) {
        console.error('❌ Erro ao criar chat:', chatError);
        return res.status(400).json({ error: 'Erro ao criar chat: ' + chatError.message });
      }

      // Armazena a sessão
      this.sessions.set(sessionId, {
        chat,
        systemMessage,
        chatHistory: [ { role: 'user', content: documentContextMessage } ],
        documentType: tipoArquivo,
        documentContent: sanitizedOriginal,
        provider: provedor,
        model: modelo,
        resumido
      });
      console.log('💾 Sessão armazenada na memória. Total de sessões:', this.sessions.size);

      // Salva no banco de dados
      let savedConversation;
      try {
        savedConversation = await Conversation.findOneAndUpdate(
          { sessionId },
          {
            sessionId,
            userId: req.user._id,
            messages: [ { role: 'user', content: documentContextMessage, timestamp: new Date() } ],
            documentType: tipoArquivo,
            documentContent: sanitizedOriginal,
            provider: provedor,
            model: modelo
          },
          { upsert: true, new: true }
        );
        console.log('🗄️ Conversa salva no banco:', !!savedConversation);
      } catch (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        // Continua mesmo se falhar salvar no banco
      }

      // Remove arquivo temporário se necessário
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.json({ 
        success: true, 
        message: 'Oráculo inicializado com sucesso',
        sessionId,
        documentPreview: sanitizedOriginal.substring(0, 200) + '...',
        resumido
      });

    } catch (error) {
      console.error('Erro ao inicializar Oráculo:', error);
      
      // Remove arquivo temporário em caso de erro
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  // Chat com o Oráculo
  async chat(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: 'SessionId e message são obrigatórios' });
      }

      let session = this.sessions.get(sessionId);
      
      // Se a sessão não está na memória, tenta recuperar do banco
      if (!session) {
        const conversation = await Conversation.findOne({ sessionId, userId: req.user._id });
        if (!conversation) {
          return res.status(404).json({ error: 'Sessão não encontrada. Inicialize o Oráculo primeiro.' });
        }

        // Recria a sessão a partir dos dados do banco
        const provider = this.chatProviders.getProvider(conversation.provider);
        if (!provider) {
          return res.status(400).json({ error: 'Provedor não encontrado' });
        }

        const chat = provider.chat(conversation.model, req.body.apiKey || process.env.GEMINI_API_KEY);
        const systemMessage = this.createSystemMessage(conversation.documentType);

        // Converte mensagens do banco para o formato do chat
        const chatHistory = conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        session = {
          chat,
          systemMessage,
          chatHistory,
          documentType: conversation.documentType,
          documentContent: conversation.documentContent,
          provider: conversation.provider,
          model: conversation.model
        };

        // Armazena a sessão recriada na memória
        this.sessions.set(sessionId, session);
      }

      const { chat, systemMessage, chatHistory } = session;

      // Envia mensagem para o chat
      const response = await chat.invoke({
        input: message,
        chatHistory,
        systemMessage
      });

      // Atualiza histórico da sessão
      session.chatHistory.push({ role: 'user', content: message });
      session.chatHistory.push({ role: 'assistant', content: response });

      // Atualiza no banco de dados
      await Conversation.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: response, timestamp: new Date() }
            ]
          }
        }
      );

      res.json({ response });

    } catch (error) {
      console.error('Erro no chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Chat com streaming
  async chatStream(req, res) {
    try {
      const { sessionId, message } = req.body;
      console.log('🔄 ChatStream - Requisição recebida:', { sessionId, hasMessage: !!message, userId: req.user._id });
      console.log('🗝️ Sessões disponíveis na memória:', Array.from(this.sessions.keys()));

      if (!sessionId || !message) {
        return res.status(400).json({ error: 'SessionId e message são obrigatórios' });
      }

      let session = this.sessions.get(sessionId);
      console.log('💾 Sessão na memória:', !!session);
      
      // Se a sessão não está na memória, tenta recuperar do banco
      if (!session) {
        console.log('🗄️ Tentando recuperar sessão do banco...');
        const conversation = await Conversation.findOne({ sessionId, userId: req.user._id });
        console.log('📊 Conversa encontrada no banco:', !!conversation);
        
        if (!conversation) {
          console.log('❌ Sessão não encontrada para:', { sessionId, userId: req.user._id });
          return res.status(404).json({ error: 'Sessão não encontrada. Inicialize o Oráculo primeiro.' });
        }

        // Recria a sessão a partir dos dados do banco
        const provider = this.chatProviders.getProvider(conversation.provider);
        if (!provider) {
          return res.status(400).json({ error: 'Provedor não encontrado' });
        }

        const chat = provider.chat(conversation.model, req.body.apiKey || process.env.GEMINI_API_KEY);
        const systemMessage = this.createSystemMessage(conversation.documentType);

        // Converte mensagens do banco para o formato do chat
        const chatHistory = conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        session = {
          chat,
          systemMessage,
          chatHistory,
          documentType: conversation.documentType,
          documentContent: conversation.documentContent,
          provider: conversation.provider,
          model: conversation.model
        };

        // Armazena a sessão recriada na memória
        this.sessions.set(sessionId, session);
      }

      const { chat, systemMessage, chatHistory } = session;

      // Configura headers para SSE
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      let fullResponse = '';
      console.log('🌊 Iniciando stream...');

      try {
        // Stream da resposta
        for await (const chunk of chat.stream({
          input: message,
          chatHistory,
          systemMessage
        })) {
          const cleanChunk = chunk.replace(/\$/g, 'S');
          fullResponse += cleanChunk;
          res.write(cleanChunk);
        }
        
        console.log('✅ Stream concluído. Tamanho da resposta:', fullResponse.length);
        res.end();
      } catch (streamError) {
        console.error('❌ Erro durante o stream:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro durante o streaming' });
        } else {
          res.end();
        }
        throw streamError;
      }

      // Atualiza histórico da sessão
      session.chatHistory.push({ role: 'user', content: message });
      session.chatHistory.push({ role: 'assistant', content: fullResponse });

      // Atualiza no banco de dados
      await Conversation.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: fullResponse, timestamp: new Date() }
            ]
          }
        }
      );

    } catch (error) {
      console.error('Erro no chat stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Limpa histórico de conversa
  async limparHistorico(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'SessionId é obrigatório' });
      }

      const session = this.sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      // Limpa histórico na sessão
      session.chatHistory = [];

      // Limpa histórico no banco
      await Conversation.findOneAndUpdate(
        { sessionId },
        { messages: [] }
      );

      res.json({ success: true, message: 'Histórico limpo com sucesso' });

    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtém histórico de conversa
  async obterHistorico(req, res) {
    try {
      const { sessionId } = req.params;

      const conversation = await Conversation.findOne({ sessionId });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }

      res.json({
        messages: conversation.messages,
        documentType: conversation.documentType,
        provider: conversation.provider,
        model: conversation.model,
        createdAt: conversation.createdAt
      });

    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtém mensagens paginadas (para scroll infinito)
  async obterMensagensPaginadas(req, res) {
    try {
      const { sessionId } = req.params;
      let { offset = 0, limit = 30 } = req.query;

      offset = parseInt(offset, 10);
      limit = parseInt(limit, 10);

      if (isNaN(offset) || offset < 0) offset = 0;
      if (isNaN(limit) || limit <= 0 || limit > 100) limit = 30;

      console.log('📝 Busca paginada:', { sessionId, offset, limit });

      const conversation = await Conversation.findOne({ sessionId });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }

      const total = conversation.messages.length;
      // Calcula fatia a partir do final (mensagens mais recentes primeiro na interface)
      const sliceEnd = total - offset; // posição final (não inclusiva)
      const sliceStart = Math.max(0, sliceEnd - limit);
      const selected = conversation.messages.slice(sliceStart, sliceEnd);
      const hasMore = sliceStart > 0;
      const nextOffset = offset + selected.length;

      console.log('✅ Resultado:', { total, sliceStart, sliceEnd, selected: selected.length, hasMore, nextOffset });

      return res.json({
        sessionId,
        messages: selected, // já em ordem cronológica ascendente
        offset,
        limit,
        total,
        hasMore,
        nextOffset
      });
    } catch (error) {
      console.error('Erro ao obter mensagens paginadas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lista provedores disponíveis
  async listarProvedores(req, res) {
    try {
      const provedores = this.chatProviders.getProviders();
      const providersInfo = {};

      provedores.forEach(provider => {
        providersInfo[provider] = {
          modelos: this.chatProviders.getModels(provider)
        };
      });

      res.json(providersInfo);

    } catch (error) {
      console.error('Erro ao listar provedores:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lista sessões ativas
  async listarSessoes(req, res) {
    try {
      const sessoesAtivas = Array.from(this.sessions.keys());
      const conversations = await Conversation.find()
        .select('sessionId documentType provider model createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20);

      res.json({
        sessoesAtivas,
        conversas: conversations
      });

    } catch (error) {
      console.error('Erro ao listar sessões:', error);
      res.status(500).json({ error: error.message });
    }
  }
}