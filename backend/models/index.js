// Exporta todos os modelos para facilitar importações
export { User } from './User.js';
export { Document } from './Document.js';
export { FlashcardSet } from './FlashcardSet.js';
export { Conversation } from './Conversation.js';
export { Session } from './Session.js';
export { Message } from './Message.js';
export { Audit } from './Audit.js';

// Re-exporta mongoose para conveniência
export { default as mongoose } from 'mongoose';