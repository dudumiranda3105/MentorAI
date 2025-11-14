import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
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
    ref: 'Document',
    required: true
  },
  provider: {
    name: {
      type: String,
      enum: ['Groq', 'Gemini'],
      required: true
    },
    model: {
      type: String,
      required: true
    },
    apiKeyHash: String // Hash da API key para auditoria (não a key real)
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'error'],
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
    },
    errors: {
      type: Number,
      default: 0
    }
  },
  settings: {
    streamingEnabled: {
      type: Boolean,
      default: true
    },
    maxTokens: {
      type: Number,
      default: 2000
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index para expirar sessões automaticamente
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índices para performance
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ lastActivity: -1 });

// Middleware para atualizar updatedAt e lastActivity
sessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('metrics') || this.isModified('settings')) {
    this.lastActivity = Date.now();
  }
  next();
});

// Método para marcar atividade
sessionSchema.methods.markActivity = function() {
  this.lastActivity = new Date();
  this.status = 'active';
  return this.save();
};

// Método para incrementar métricas
sessionSchema.methods.incrementMetric = function(metric, value = 1) {
  if (this.metrics[metric] !== undefined) {
    this.metrics[metric] += value;
    return this.save();
  }
};

// Método para calcular tempo médio de resposta
sessionSchema.methods.updateAverageResponseTime = function(responseTime) {
  const currentAvg = this.metrics.averageResponseTime;
  const totalMessages = this.metrics.totalMessages;
  
  if (totalMessages === 0) {
    this.metrics.averageResponseTime = responseTime;
  } else {
    this.metrics.averageResponseTime = 
      (currentAvg * totalMessages + responseTime) / (totalMessages + 1);
  }
  
  return this.save();
};

// Método estático para limpar sessões expiradas
sessionSchema.statics.cleanExpiredSessions = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: 'expired' },
      { lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 dias
    ]
  });
};

// Método estático para buscar sessões ativas de um usuário
sessionSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('documentId').sort({ lastActivity: -1 });
};

export const Session = mongoose.model('Session', sessionSchema);