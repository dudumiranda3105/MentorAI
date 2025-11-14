import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: String,
  action: {
    type: String,
    enum: [
      'user_login',
      'user_logout', 
      'user_register',
      'user_update',
      'password_change',
      'flashcard_create',
      'flashcard_delete',
      'document_upload',
      'document_process',
      'oraculo_init',
      'oraculo_chat',
      'agent_context_update',
      'session_create',
      'session_expire',
      'api_error',
      'security_violation'
    ],
    required: true,
    index: true
  },
  resource: {
    type: {
      type: String,
      enum: ['user', 'document', 'flashcard', 'session', 'message', 'system']
    },
    id: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Permite qualquer estrutura de dados
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number,
    provider: String,
    model: String
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  },
  success: {
    type: Boolean,
    default: true
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL index para limpeza automática de logs antigos (90 dias)
auditSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Índices compostos para queries frequentes
auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ severity: 1, timestamp: -1 });

// Método estático para criar log de auditoria
auditSchema.statics.log = function(data) {
  return this.create({
    timestamp: new Date(),
    ...data
  });
};

// Método estático para buscar logs por usuário
auditSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.action) {
    query.where('action').equals(options.action);
  }
  
  if (options.severity) {
    query.where('severity').equals(options.severity);
  }
  
  if (options.startDate) {
    query.where('timestamp').gte(options.startDate);
  }
  
  if (options.endDate) {
    query.where('timestamp').lte(options.endDate);
  }
  
  return query.sort({ timestamp: -1 }).limit(options.limit || 100);
};

// Método estático para estatísticas de uso
auditSchema.statics.getUserStats = function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Método estático para relatório de erros
auditSchema.statics.getErrorReport = function(hours = 24) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        severity: { $in: ['error', 'critical'] },
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          action: '$action',
          errorCode: '$error.code'
        },
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' },
        samples: { $push: '$error.message' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export const Audit = mongoose.model('Audit', auditSchema);