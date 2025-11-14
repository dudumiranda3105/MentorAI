import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  pergunta: String,
  resposta: String,
});

const flashcardSetSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    textoOriginal: { type: String, required: true },
    flashcards: [flashcardSchema],
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document"
    },
    tags: [{
      type: String,
      trim: true
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    category: {
      type: String,
      trim: true
    },
    usage: {
      timesStudied: {
        type: Number,
        default: 0
      },
      lastStudied: Date,
      averageScore: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true }
);

// Índices para performance
flashcardSetSchema.index({ userId: 1, createdAt: -1 });
flashcardSetSchema.index({ tags: 1 });
flashcardSetSchema.index({ category: 1 });
flashcardSetSchema.index({ isPublic: 1 });

// Método para incrementar uso
flashcardSetSchema.methods.incrementUsage = function() {
  this.usage.timesStudied++;
  this.usage.lastStudied = new Date();
  return this.save();
};

// Método para atualizar score
flashcardSetSchema.methods.updateScore = function(score) {
  const currentAvg = this.usage.averageScore;
  const timesStudied = this.usage.timesStudied;
  
  if (timesStudied === 0) {
    this.usage.averageScore = score;
  } else {
    this.usage.averageScore = (currentAvg * timesStudied + score) / (timesStudied + 1);
  }
  
  return this.save();
};

// Método estático para buscar por usuário
flashcardSetSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.category) {
    query.where('category').equals(options.category);
  }
  
  if (options.tags) {
    query.where('tags').in(options.tags);
  }
  
  if (options.difficulty) {
    query.where('difficulty').equals(options.difficulty);
  }
  
  return query.sort({ updatedAt: -1 });
};

export const FlashcardSet = mongoose.model("FlashcardSet", flashcardSetSchema);
