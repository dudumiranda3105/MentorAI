import { ChatProviders } from './chatProviders.js';

const chatProviders = new ChatProviders();

export async function gerarFlashcards(texto, provider = 'Gemini', model = 'gemini-2.5-flash', apiKey = process.env.GEMINI_API_KEY, userContext = null) {
  const cleanText = texto.trim();
  console.log('🎯 Iniciando geração de flashcards:', {
    textoLength: cleanText.length,
    provider,
    model,
    hasApiKey: !!apiKey,
    hasUserContext: !!userContext
  });
  
  if (!cleanText) return [];

  try {
    // Se não tiver API key, usa a versão mock
    if (!apiKey) {
      console.warn('⚠️ API key não configurada, usando flashcards mock');
      return gerarFlashcardsMock(texto);
    }

    const chatProvider = chatProviders.getProvider(provider);
    if (!chatProvider) {
      console.warn('Provedor não encontrado, usando flashcards mock');
      return gerarFlashcardsMock(texto);
    }

    const chat = chatProvider.chat(model, apiKey);
    
    // Construir prompt personalizado baseado no contexto do usuário
    let personalityInstruction = '';
    if (userContext?.personality) {
      const personalityMap = {
        formal: 'Use linguagem formal e acadêmica.',
        casual: 'Use linguagem casual e descontraída.',
        friendly: 'Use linguagem amigável e acessível.',
        professional: 'Use linguagem profissional e técnica.'
      };
      personalityInstruction = personalityMap[userContext.personality] || '';
    }

    let expertiseInstruction = '';
    if (userContext?.expertise && userContext.expertise.length > 0) {
      expertiseInstruction = `Considere suas áreas de especialização: ${userContext.expertise.join(', ')}.`;
    }

    let customInstructions = '';
    if (userContext?.customInstructions) {
      customInstructions = `Instruções adicionais: ${userContext.customInstructions}`;
    }
    
    const prompt = `Analise o seguinte texto e crie flashcards educativos baseados no conteúdo.

IMPORTANTE: Responda APENAS com um JSON válido no formato exato abaixo, sem texto adicional:

[
  {
    "pergunta": "pergunta clara e específica",
    "resposta": "resposta concisa e precisa"
  }
]

Diretrizes:
- Crie entre 5-15 flashcards (dependendo do tamanho do texto)
- Foque nos conceitos mais importantes
- Perguntas devem ser claras e específicas
- Respostas devem ser concisas mas completas
- Evite perguntas muito óbvias ou muito complexas
- Varie os tipos de perguntas (definições, explicações, exemplos, etc.)
${personalityInstruction ? `- ${personalityInstruction}` : ''}
${expertiseInstruction ? `- ${expertiseInstruction}` : ''}
${customInstructions ? `- ${customInstructions}` : ''}

Texto para análise:
${cleanText}`;

    // Sistema personalizado baseado no contexto do usuário
    let systemMessage = userContext?.systemPrompt || 'Você é um assistente especializado em criar flashcards educativos a partir de textos. Sempre responda apenas com JSON válido.';
    
    const response = await chat.invoke({
      input: prompt,
      chatHistory: [],
      systemMessage: systemMessage
    });
    
    try {
      // Limpa a resposta removendo possíveis marcações de código
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const flashcards = JSON.parse(cleanResponse);
      
      // Valida se é um array e se tem a estrutura correta
      if (Array.isArray(flashcards) && flashcards.length > 0) {
        const validFlashcards = flashcards.filter(card => 
          card.pergunta && card.resposta && 
          typeof card.pergunta === 'string' && 
          typeof card.resposta === 'string'
        );
        
        console.log('✅ Flashcards válidos da IA:', validFlashcards.length);
        
        if (validFlashcards.length > 0) {
          return validFlashcards;
        }
      }
      
      console.warn('⚠️ Resposta da IA inválida, usando flashcards mock');
      const mockCards = gerarFlashcardsMock(texto);
      console.log('🎲 Flashcards mock gerados:', mockCards.length);
      return mockCards;
      
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      console.log('Resposta recebida:', response);
      return gerarFlashcardsMock(texto);
    }
    
  } catch (error) {
    console.error('Erro ao gerar flashcards com IA:', error);
    return gerarFlashcardsMock(texto);
  }
}

// Função de fallback com flashcards mock melhorados
function gerarFlashcardsMock(texto) {
  console.log('🎲 Gerando flashcards mock para texto de', texto.length, 'caracteres');
  const cleanText = texto.trim();
  if (!cleanText) {
    console.log('❌ Texto vazio para mock');
    return [];
  }

  const paragrafos = cleanText
    .split(/\n\s*\n/) // Split em parágrafos (dupla quebra de linha)
    .map(p => p.trim())
    .filter(p => p.length > 20); // Reduzido para 20 para ser mais flexível

  console.log('📄 Parágrafos encontrados:', paragrafos.length);
  const flashcards = [];

  paragrafos.forEach((paragrafo, index) => {
    // Extrai conceitos principais (palavras importantes)
    const palavrasChave = extrairPalavrasChave(paragrafo);
    
    // Cria diferentes tipos de perguntas
    if (palavrasChave.length > 0) {
      // Pergunta sobre conceito principal
      flashcards.push({
        pergunta: `O que o texto explica sobre ${palavrasChave[0]}?`,
        resposta: paragrafo.substring(0, 200) + (paragrafo.length > 200 ? '...' : '')
      });
    }
    
    // Pergunta sobre o parágrafo como um todo
    if (paragrafo.length > 100) {
      flashcards.push({
        pergunta: `Qual é a ideia principal apresentada neste trecho?`,
        resposta: paragrafo
      });
    }
  });

  // Se não conseguiu gerar nenhum flashcard, cria alguns básicos
  if (flashcards.length === 0) {
    console.log('⚠️ Nenhum flashcard por parágrafos, tentando por sentenças');
    const sentencas = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
    console.log('📝 Sentenças encontradas:', sentencas.length);
    
    sentencas.slice(0, 5).forEach((sentenca, index) => {
      flashcards.push({
        pergunta: `Complete a informação: "${sentenca.trim().substring(0, 30)}..."`,
        resposta: sentenca.trim()
      });
    });
  }

  // Se ainda não tiver flashcards, cria pelo menos um genérico
  if (flashcards.length === 0) {
    console.log('⚠️ Criando flashcard genérico');
    flashcards.push({
      pergunta: 'Qual é o conteúdo principal do texto fornecido?',
      resposta: cleanText.substring(0, 200) + (cleanText.length > 200 ? '...' : '')
    });
  }

  console.log('✅ Total de flashcards mock gerados:', flashcards.length);
  return flashcards.slice(0, 10); // Limita a 10 flashcards
}

function extrairPalavrasChave(texto) {
  // Lista de palavras comum a ignorar
  const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'para', 'por', 'com', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'são', 'foi', 'foram', 'ser', 'ter', 'tem', 'teve', 'isso', 'isto', 'aquilo', 'este', 'esta', 'esse', 'essa', 'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas'];
  
  const palavras = texto.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(palavra => palavra.length > 3 && !stopWords.includes(palavra));
  
  // Conta frequência das palavras
  const frequencia = {};
  palavras.forEach(palavra => {
    frequencia[palavra] = (frequencia[palavra] || 0) + 1;
  });
  
  // Retorna as palavras mais frequentes
  return Object.keys(frequencia)
    .sort((a, b) => frequencia[b] - frequencia[a])
    .slice(0, 3);
}
