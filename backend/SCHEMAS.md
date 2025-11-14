# 📊 Schemas do Banco de Dados - Mentor AI

## 🗂️ **Visão Geral dos Models**

O sistema utiliza 7 schemas principais para gerenciar todos os aspectos da aplicação:

### **📁 Estrutura dos Models**
```
models/
├── User.js          # Usuários e autenticação
├── Document.js      # Documentos processados
├── FlashcardSet.js  # Coleções de flashcards
├── Conversation.js  # Conversas do Oráculo
├── Session.js       # Sessões ativas
├── Message.js       # Mensagens individuais
├── Audit.js         # Logs de auditoria
└── index.js         # Exportações centralizadas
```

---

## 👤 **User Schema**
**Gerencia usuários, autenticação e preferências**

### **Campos Principais**
- `name`: Nome do usuário
- `email`: Email único
- `password`: Senha hash
- `preferences`: Tema, idioma, notificações
- `subscription`: Plano, datas, status
- `usage`: Estatísticas de uso

### **Métodos**
- `incrementUsage(type)`: Incrementa contador de uso
- `isPremium()`: Verifica se tem plano premium

---

## 📄 **Document Schema**
**Armazena e gerencia documentos processados**

### **Campos Principais**
- `userId`: Referência ao usuário
- `title`: Título do documento
- `type`: Site, YouTube, PDF, CSV, TXT
- `content`: Conteúdo extraído
- `metadata`: Tamanho, páginas, idioma
- `processing`: Status, erro, tempo

### **Índices**
- `{ userId: 1, createdAt: -1 }`
- `{ type: 1 }`
- `{ 'processing.status': 1 }`

---

## 🎴 **FlashcardSet Schema**
**Coleções de flashcards melhoradas**

### **Campos Principais**
- `titulo`: Nome da coleção
- `flashcards`: Array de perguntas/respostas
- `userId`: Referência ao usuário
- `documentId`: Documento de origem (opcional)
- `difficulty`: easy, medium, hard
- `usage`: Estatísticas de estudo

### **Melhorias Implementadas**
- Suporte a tags e categorias
- Métricas de desempenho
- Níveis de dificuldade
- Histórico de uso

---

## 💬 **Conversation Schema**
**Conversas do Oráculo aprimoradas**

### **Campos Principais**
- `sessionId`: ID único da sessão
- `userId`: Referência ao usuário
- `messages`: Array de mensagens
- `documentType`: Tipo de documento
- `provider`: Groq, Gemini
- `metrics`: Tokens, tempo de resposta

### **Melhorias Implementadas**
- Métricas automáticas
- Status de conversa
- Metadata por mensagem
- Tags para organização

---

## 🔐 **Session Schema**
**Gerenciamento avançado de sessões**

### **Campos Principais**
- `sessionId`: ID único
- `userId`: Referência ao usuário
- `provider`: Configuração da IA
- `metrics`: Estatísticas de uso
- `expiresAt`: Expiração automática

### **Funcionalidades**
- TTL automático (24h)
- Métricas em tempo real
- Configurações personalizadas
- Limpeza automática

---

## 📨 **Message Schema**
**Mensagens individuais com metadata**

### **Campos Principais**
- `sessionId`: Sessão de origem
- `role`: user, assistant, system
- `content`: Conteúdo da mensagem
- `metadata`: Tokens, tempo, modelo
- `feedback`: Avaliações do usuário

### **Funcionalidades**
- Sistema de feedback
- Histórico de edições
- Estatísticas por mensagem
- Suporte a threading

---

## 📊 **Audit Schema**
**Sistema completo de auditoria**

### **Campos Principais**
- `action`: Tipo de ação
- `userId`: Usuário (se aplicável)
- `resource`: Recurso afetado
- `metadata`: IP, User-Agent, endpoint
- `severity`: info, warning, error, critical

### **Funcionalidades**
- Log automático de ações
- Relatórios de erro
- Estatísticas de uso
- TTL de 90 dias

---

## 🛠️ **Scripts de Manutenção**

### **Inicialização**
```bash
npm run db:init
```
- Cria usuário admin padrão
- Configura índices personalizados
- Inicializa auditoria

### **Limpeza**
```bash
npm run db:cleanup
```
- Remove sessões expiradas
- Limpa documentos com falha
- Otimiza performance

### **Ajuda**
```bash
npm run db:help
```

---

## 📈 **Índices de Performance**

### **Principais Índices**
```javascript
// Usuários
{ email: 1, isActive: 1 }

// Documentos
{ userId: 1, createdAt: -1 }
{ type: 1 }
{ 'processing.status': 1 }

// Flashcards
{ userId: 1, createdAt: -1 }
{ tags: 1 }
{ category: 1 }

// Conversas
{ userId: 1, status: 1, updatedAt: -1 }
{ sessionId: 1 }

// Sessões
{ expiresAt: 1 } // TTL
{ userId: 1, status: 1 }

// Mensagens
{ sessionId: 1, timestamp: 1 }
{ userId: 1, createdAt: -1 }

// Auditoria
{ timestamp: 1 } // TTL 90 dias
{ userId: 1, timestamp: -1 }
{ action: 1, timestamp: -1 }
```

---

## 🔄 **Relacionamentos**

### **Diagrama de Relacionamentos**
```
User (1) ----< (N) Document
User (1) ----< (N) FlashcardSet
User (1) ----< (N) Conversation
User (1) ----< (N) Session
User (1) ----< (N) Message
User (1) ----< (N) Audit

Document (1) ----< (N) FlashcardSet
Document (1) ----< (N) Conversation

Session (1) ----< (N) Message
Conversation (1) ----< (N) Message
```

---

## 🎯 **Funcionalidades Avançadas**

### **Middleware Automático**
- Timestamps automáticos
- Cálculo de métricas
- Validações customizadas
- Limpeza de dados

### **Métodos Estáticos**
- Buscas otimizadas por usuário
- Relatórios e estatísticas
- Limpeza automática
- Agregações complexas

### **TTL (Time To Live)**
- Sessões: 24 horas
- Logs de auditoria: 90 dias
- Limpeza automática pelo MongoDB

---

## 🔧 **Como Usar**

### **Importação Simplificada**
```javascript
import { User, Document, FlashcardSet, Conversation } from './models/index.js';
```

### **Exemplos de Uso**
```javascript
// Criar usuário
const user = new User({
  name: 'João Silva',
  email: 'joao@email.com',
  password: 'hashedPassword'
});

// Buscar flashcards do usuário
const flashcards = await FlashcardSet.findByUser(userId, {
  category: 'matemática',
  difficulty: 'medium'
});

// Log de auditoria
await Audit.log({
  userId: user._id,
  action: 'flashcard_create',
  resource: { type: 'flashcard', id: flashcard._id },
  details: { title: flashcard.titulo }
});
```

---

## 🚀 **Próximas Melhorias**

- [ ] Suporte a soft delete
- [ ] Versionamento de documentos
- [ ] Cache de queries frequentes
- [ ] Compressão de conteúdo
- [ ] Backup automático
- [ ] Métricas em tempo real
- [ ] Alertas automáticos
- [ ] Relatórios avançados