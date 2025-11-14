import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Audit } from './models/index.js';

dotenv.config();

async function initializeDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Criar usuário administrador padrão (se não existir)
    const adminEmail = 'admin@mentor-ai.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Administrador',
        email: adminEmail,
        password: 'admin123', // Em produção, use hash apropriado
        subscription: {
          plan: 'pro',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
        }
      });
      
      await adminUser.save();
      console.log('✅ Usuário administrador criado');
      
      // Log da criação do admin
      await Audit.log({
        action: 'user_register',
        resource: { type: 'user', id: adminUser._id },
        details: { email: adminEmail, role: 'admin' },
        metadata: { source: 'database_init' }
      });
    } else {
      console.log('ℹ️  Usuário administrador já existe');
    }

    // Criar índices adicionais se necessário
    await createCustomIndexes();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    
    await Audit.log({
      action: 'api_error',
      details: { error: error.message },
      severity: 'critical',
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  } finally {
    await mongoose.disconnect();
  }
}

async function createCustomIndexes() {
  try {
    // Índices compostos personalizados
    await mongoose.connection.db.collection('users').createIndex(
      { email: 1, isActive: 1 },
      { background: true }
    );
    
    await mongoose.connection.db.collection('conversations').createIndex(
      { userId: 1, status: 1, updatedAt: -1 },
      { background: true }
    );
    
    await mongoose.connection.db.collection('documents').createIndex(
      { userId: 1, type: 1, 'processing.status': 1 },
      { background: true }
    );
    
    console.log('✅ Índices customizados criados');
  } catch (error) {
    console.log('⚠️  Alguns índices podem já existir:', error.message);
  }
}

// Função para limpar dados antigos (manutenção)
async function cleanupOldData() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    // Limpar sessões expiradas
    const { Session } = await import('./models/index.js');
    const deletedSessions = await Session.cleanExpiredSessions();
    console.log(`🧹 ${deletedSessions.deletedCount} sessões expiradas removidas`);
    
    // Limpar documentos com falha há mais de 30 dias
    const { Document } = await import('./models/index.js');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deletedDocs = await Document.deleteMany({
      'processing.status': 'failed',
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`🧹 ${deletedDocs.deletedCount} documentos com falha removidos`);
    
    console.log('✅ Limpeza concluída');
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Executar baseado nos argumentos da linha de comando
const command = process.argv[2];

switch (command) {
  case 'init':
    initializeDatabase();
    break;
  case 'cleanup':
    cleanupOldData();
    break;
  default:
    console.log(`
🚀 Script de Manutenção do Banco de Dados

Comandos disponíveis:
  node scripts/db-init.js init     - Inicializar banco com dados básicos
  node scripts/db-init.js cleanup  - Limpar dados antigos/expirados

Exemplo:
  npm run db:init
  npm run db:cleanup
    `);
}