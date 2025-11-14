import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
    responseTime: Number, // em milissegundos
    model: String,
    provider: String,
    temperature: Number,
    streamingUsed: {
      type: Boolean,
      default: false
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: Boolean,
    comment: String,
    reportedAt: Date
  },
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    error: String,
    retries: {
      type: Number,
      default: 0
    }
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para performance
messageSchema.index({ sessionId: 1, timestamp: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ role: 1 });
messageSchema.index({ 'feedback.rating': 1 });

// Método para adicionar feedback
messageSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = {
    ...this.feedback,
    ...feedbackData,
    reportedAt: new Date()
  };
  return this.save();
};

// Método para editar mensagem
messageSchema.methods.editContent = function(newContent) {
  if (this.content !== newContent) {
    this.editHistory.push({
      content: this.content,
      editedAt: new Date()
    });
    this.content = newContent;
    this.isEdited = true;
  }
  return this.save();
};

// Método estático para buscar mensagens de uma sessão
messageSchema.statics.findBySession = function(sessionId, options = {}) {
  const query = this.find({ sessionId });
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.role) {
    query.where('role').equals(options.role);
  }
  
  return query.sort({ timestamp: 1 });
};

// Método estático para estatísticas de feedback
messageSchema.statics.getFeedbackStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), 'feedback.rating': { $exists: true } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$feedback.rating' },
        totalRatings: { $sum: 1 },
        helpfulCount: { $sum: { $cond: ['$feedback.helpful', 1, 0] } }
      }
    }
  ]);
};

export const Message = mongoose.model('Message', messageSchema);