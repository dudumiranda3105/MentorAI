import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { gerarFlashcards } from "../utils/generateFlashcards.js";
import { FlashcardSet } from "../models/FlashcardSet.js";
import { User } from "../models/User.js";
import { OraculoController } from "./oraculoController.js";
import { AuthController } from "./authController.js";
import { authenticateToken, optionalAuth, requirePremium } from "./authMiddleware.js";

dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true
});

app.use(limiter);
app.set('trust proxy', 1); // Para obter IP real atrás de proxy

// Configuração do multer para upload de arquivos
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Instância do controlador do Oráculo
const oraculoController = new OraculoController();

const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// ========== ROTAS DO ORÁCULO ==========

// Listar provedores e modelos disponíveis (pública)
app.get("/api/oraculo/provedores", (req, res) => {
  oraculoController.listarProvedores(req, res);
});

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Registrar usuário
app.post("/api/auth/register", authLimiter, (req, res) => {
  AuthController.register(req, res);
});

// Login
app.post("/api/auth/login", authLimiter, (req, res) => {
  AuthController.login(req, res);
});

// Logout
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  AuthController.logout(req, res);
});

// Obter perfil do usuário
app.get("/api/auth/profile", authenticateToken, (req, res) => {
  AuthController.getProfile(req, res);
});

// Atualizar perfil
app.put("/api/auth/profile", authenticateToken, (req, res) => {
  AuthController.updateProfile(req, res);
});

// Alterar senha
app.put("/api/auth/password", authenticateToken, (req, res) => {
  AuthController.changePassword(req, res);
});

// Verificar token (para o frontend)
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Obter contexto do agente
app.get("/api/auth/agent-context", authenticateToken, (req, res) => {
  AuthController.getAgentContext(req, res);
});

// Atualizar contexto do agente
app.put("/api/auth/agent-context", authenticateToken, (req, res) => {
  AuthController.updateAgentContext(req, res);
});

// ========== ATUALIZAR ROTAS EXISTENTES COM AUTH ==========

// Proteger rotas de flashcards
app.post("/api/flashcards/gerar", authenticateToken, async (req, res) => {
  try {
    const { texto, provider = 'Gemini', model = 'gemini-2.5-flash', apiKey } = req.body;


    if (!texto || typeof texto !== "string") {
      return res.status(400).json({ error: "Texto é obrigatório." });
    }

    if (texto.length < 50) {
      return res.status(400).json({ error: "Texto deve ter pelo menos 50 caracteres para gerar flashcards significativos." });
    }

    // Usa a API key do usuário ou a padrão do sistema
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

    
    // Buscar contexto personalizado do usuário
    const user = await User.findById(req.user._id).select('preferences.agentContext');
    const userContext = user?.preferences?.agentContext;

    
    const flashcards = await gerarFlashcards(texto, provider, model, finalApiKey, userContext);

    
    if (!flashcards || flashcards.length === 0) {
      return res.status(400).json({ error: "Não foi possível gerar flashcards a partir do texto fornecido." });
    }

    // Incrementar uso do usuário
    await req.user.incrementUsage('flashcardsCreated');

    return res.json({ 
      flashcards,
      usedAI: !!finalApiKey,
      provider: finalApiKey ? provider : 'mock'
    });
  } catch (error) {
    console.error('Erro ao gerar flashcards:', error);
    return res.status(500).json({ error: "Erro interno ao gerar flashcards." });
  }
});

app.post("/api/flashcards/salvar", authenticateToken, async (req, res) => {
  try {
    const { titulo, texto, flashcards, provider = 'Gemini', model = 'gemini-2.5-flash', apiKey } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: "Título é obrigatório." });
    }

    let finalFlashcards = flashcards;

    // Se não foram fornecidos flashcards, gera a partir do texto
    if (!finalFlashcards && texto) {
      const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
      
      // Buscar contexto personalizado do usuário
      const user = await User.findById(req.user._id).select('preferences.agentContext');
      const userContext = user?.preferences?.agentContext;
      
      finalFlashcards = await gerarFlashcards(texto, provider, model, finalApiKey, userContext);
    }

    if (!finalFlashcards || finalFlashcards.length === 0) {
      return res.status(400).json({ error: "Flashcards ou texto são obrigatórios." });
    }

    const doc = await FlashcardSet.create({
      titulo,
      textoOriginal: texto || '',
      flashcards: finalFlashcards,
      userId: req.user._id
    });

    // Incrementar uso do usuário
    await req.user.incrementUsage('flashcardsCreated');

    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar flashcards." });
  }
});

app.get("/api/flashcards", authenticateToken, async (req, res) => {
  const docs = await FlashcardSet.findByUser(req.user._id)
    .populate('userId', 'name email')
    .limit(20);
  return res.json(docs);
});

// Proteger rotas do Oráculo
app.post("/api/oraculo/inicializar", authenticateToken, upload.single('arquivo'), (req, res) => {
  oraculoController.inicializaOraculo(req, res);
});

app.post("/api/oraculo/chat", authenticateToken, (req, res) => {
  oraculoController.chat(req, res);
});

app.post("/api/oraculo/chat/stream", authenticateToken, (req, res) => {
  oraculoController.chatStream(req, res);
});

app.post("/api/oraculo/limpar-historico", authenticateToken, (req, res) => {
  oraculoController.limparHistorico(req, res);
});

app.get("/api/oraculo/historico/:sessionId", authenticateToken, (req, res) => {
  oraculoController.obterHistorico(req, res);
});

// Mensagens paginadas para scroll infinito
app.get("/api/oraculo/mensagens/:sessionId", authenticateToken, (req, res) => {
  oraculoController.obterMensagensPaginadas(req, res);
});

// Listar sessões ativas do usuário
app.get("/api/oraculo/sessoes", authenticateToken, (req, res) => {
  oraculoController.listarSessoes(req, res);
});

// Debug: Verificar status das sessões
app.get("/api/oraculo/debug", authenticateToken, (req, res) => {
  console.log('🔍 Debug de sessões requisitado por:', req.user.email);
  const sessoesAtivas = Array.from(oraculoController.sessions.keys());
  res.json({
    sessoesNaMemoria: sessoesAtivas,
    totalSessoes: oraculoController.sessions.size,
    userId: req.user._id
  });
});

// Nova rota: Gerar flashcards a partir de documentos
app.post("/api/flashcards/gerar-de-documento", authenticateToken, upload.single('arquivo'), async (req, res) => {
  try {
    const { tipoArquivo, provider = 'Gemini', model = 'gemini-2.5-flash', apiKey } = req.body;
    let { arquivo } = req.body;

    console.log('📝 Gerando flashcards de documento:', { 
      tipoArquivo, 
      provider, 
      model,
      hasFile: !!req.file,
      arquivo: req.file ? req.file.filename : arquivo
    });

    if (!tipoArquivo) {
      return res.status(400).json({ error: "Tipo de arquivo é obrigatório." });
    }

    // Se for upload, usa o arquivo enviado
    if (req.file) {
      arquivo = req.file.path;
      console.log('📂 Arquivo carregado:', { path: arquivo, size: req.file.size });
    }

    if (!arquivo) {
      return res.status(400).json({ error: "Arquivo é obrigatório." });
    }

    // Carrega o documento usando o sistema do Oráculo
    console.log('📄 Carregando documento...');
    const documento = await oraculoController.carregaArquivos(tipoArquivo, arquivo);
    console.log('✅ Documento carregado:', documento ? `${documento.length} caracteres` : 'vazio');

    if (!documento || documento.trim() === '') {
      return res.status(400).json({ error: 'Não foi possível extrair conteúdo do documento' });
    }

    // Verifica erro de JavaScript
    if (documento.includes('Just a moment...Enable JavaScript and cookies to continue')) {
      return res.status(400).json({ 
        error: 'Erro ao carregar página. Tente novamente!' 
      });
    }

    // Gera flashcards a partir do conteúdo do documento
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    // Buscar contexto personalizado do usuário
    const user = await User.findById(req.user._id).select('preferences.agentContext');
    const userContext = user?.preferences?.agentContext;
    
    console.log('🤖 Gerando flashcards com IA...');
    const flashcards = await gerarFlashcards(documento, provider, model, finalApiKey, userContext);
    console.log('✅ Flashcards gerados:', flashcards ? flashcards.length : 0);

    if (!flashcards || flashcards.length === 0) {
      return res.status(400).json({ error: "Não foi possível gerar flashcards a partir do documento." });
    }

    // Remove arquivo temporário se necessário
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Incrementar uso do usuário
    await req.user.incrementUsage('flashcardsCreated');
    await req.user.incrementUsage('documentsProcessed');

    return res.json({ 
      flashcards,
      documentContent: documento.substring(0, 500) + '...',
      usedAI: !!finalApiKey,
      provider: finalApiKey ? provider : 'mock',
      documentType: tipoArquivo
    });

  } catch (error) {
    console.error('Erro ao gerar flashcards de documento:', error);
    
    // Remove arquivo temporário em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: "Erro interno ao processar documento." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`🔐 Autenticação habilitada`);
  console.log(`🚪 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
