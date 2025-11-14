import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    metadata: {
      tokens: Number,
      responseTime: Number,
      model: String,
      provider: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  documentType: {
    type: String,
    enum: ['Site', 'Link Youtube', '.PDF', '.CSV', '.TXT'],
    required: true
  },
  documentContent: {
    type: String,
    required: true
  },
  documentTitle: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  metrics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para performance
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ documentType: 1 });
ConversationSchema.index({ provider: 1 });
ConversationSchema.index({ status: 1 });

// Middleware para atualizar timestamps e métricas
ConversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Atualizar métricas automaticamente
  if (this.isModified('messages')) {
    this.metrics.totalMessages = this.messages.length;
    
    const responseTimes = this.messages
      .filter(msg => msg.metadata && msg.metadata.responseTime)
      .map(msg => msg.metadata.responseTime);
      
    if (responseTimes.length > 0) {
      this.metrics.averageResponseTime = 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }
    
    this.metrics.totalTokens = this.messages
      .filter(msg => msg.metadata && msg.metadata.tokens)
      .reduce((total, msg) => total + msg.metadata.tokens, 0);
  }
  
  next();
});

// Método para adicionar mensagem
ConversationSchema.methods.addMessage = function(messageData) {
  this.messages.push({
    ...messageData,
    timestamp: new Date()
  });
  return this.save();
};

// Método para arquivar conversa
ConversationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Método estático para buscar por usuário
ConversationSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId, status: { $ne: 'deleted' } });
  
  if (options.documentType) {
    query.where('documentType').equals(options.documentType);
  }
  
  if (options.provider) {
    query.where('provider').equals(options.provider);
  }
  
  return query.sort({ updatedAt: -1 });
};

export const Conversation = mongoose.model('Conversation', ConversationSchema);