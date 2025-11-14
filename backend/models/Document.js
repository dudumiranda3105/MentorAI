import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Site', 'Link Youtube', '.PDF', '.CSV', '.TXT'],
    required: true
  },
  originalSource: {
    type: String,
    required: true // URL ou nome do arquivo original
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    fileSize: Number, // em bytes
    pages: Number, // para PDFs
    duration: String, // para vídeos YouTube
    wordCount: Number,
    language: String,
    extractedAt: {
      type: Date,
      default: Date.now
    }
  },
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: String,
    processingTime: Number // em milissegundos
  },
  usage: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    flashcardsCreated: {
      type: Number,
      default: 0
    },
    oraculoSessions: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
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

// Índices para performance
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ type: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ 'processing.status': 1 });

// Middleware para atualizar updatedAt
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para incrementar uso
documentSchema.methods.incrementUsage = function(type = 'timesUsed') {
  if (this.usage[type] !== undefined) {
    this.usage[type]++;
    this.usage.lastUsed = new Date();
    return this.save();
  }
};

// Método estático para buscar por usuário
documentSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.type) {
    query.where('type').equals(options.type);
  }
  
  if (options.tags) {
    query.where('tags').in(options.tags);
  }
  
  return query.sort({ updatedAt: -1 });
};

export const Document = mongoose.model('Document', documentSchema);