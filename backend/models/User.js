import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'pt-br'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    agentContext: {
      systemPrompt: {
        type: String,
        default: 'Você é um assistente educacional especializado em criar flashcards e responder perguntas sobre documentos. Seja claro, conciso e pedagogicamente útil.'
      },
      personality: {
        type: String,
        enum: ['formal', 'casual', 'friendly', 'professional'],
        default: 'friendly'
      },
      expertise: {
        type: [String],
        default: ['educação', 'flashcards', 'estudo']
      },
      customInstructions: {
        type: String,
        default: ''
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    flashcardsCreated: {
      type: Number,
      default: 0
    },
    oraculoSessions: {
      type: Number,
      default: 0
    },
    documentsProcessed: {
      type: Number,
      default: 0
    }
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para incrementar uso
userSchema.methods.incrementUsage = function(type) {
  if (this.usage[type] !== undefined) {
    this.usage[type]++;
    return this.save();
  }
};

// Método para verificar se é premium
userSchema.methods.isPremium = function() {
  return this.subscription.isActive && 
         ['premium', 'pro'].includes(this.subscription.plan) &&
         this.subscription.endDate > new Date();
};

export const User = mongoose.model('User', userSchema);