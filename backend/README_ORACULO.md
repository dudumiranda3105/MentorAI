# API do Oráculo - Documentação

## Visão Geral
Esta API fornece funcionalidades de chat com IA baseado em documentos, similar ao sistema Oráculo original em Python, mas adaptado para JavaScript/Node.js.

## Funcionalidades Principais

### 1. Carregamento de Documentos
- **Sites**: Extrai conteúdo de páginas web
- **YouTube**: Extrai transcrições de vídeos
- **PDF**: Processa arquivos PDF
- **CSV**: Lê e processa arquivos CSV
- **TXT**: Lê arquivos de texto simples

### 2. Provedores de IA
- **Groq**: Modelos Llama e OpenAI
- **Gemini**: Modelos Google Gemini

### 3. Funcionalidades de Chat
- Chat com resposta completa
- Chat com streaming em tempo real
- Histórico de conversas persistente
- Múltiplas sessões simultâneas

## Endpoints da API

### GET `/api/oraculo/provedores`
Lista todos os provedores e modelos disponíveis.

**Resposta:**
```json
{
  "Groq": {
    "modelos": ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", ...]
  },
  "Gemini": {
    "modelos": ["gemini-2.5-flash", "gemini-2.5-pro", ...]
  }
}
```

### POST `/api/oraculo/inicializar`
Inicializa uma nova sessão do Oráculo com um documento.

**Parâmetros:**
- `provedor`: String (Groq ou Gemini)
- `modelo`: String (modelo específico)
- `apiKey`: String (chave da API)
- `tipoArquivo`: String (Site, Link Youtube, .PDF, .CSV, .TXT)
- `arquivo`: String (URL ou arquivo upload)
- `sessionId`: String (ID único da sessão)

**Para uploads de arquivo:**
- Use `multipart/form-data`
- Campo `arquivo` para o arquivo
- Outros parâmetros no corpo da requisição

**Exemplo (Site):**
```json
{
  "provedor": "Groq",
  "modelo": "llama-3.1-8b-instant",
  "apiKey": "sua_api_key",
  "tipoArquivo": "Site",
  "arquivo": "https://example.com",
  "sessionId": "session_123"
}
```

### POST `/api/oraculo/chat`
Envia uma mensagem para o Oráculo e recebe resposta completa.

**Parâmetros:**
```json
{
  "sessionId": "session_123",
  "message": "Qual é o resumo do documento?"
}
```

**Resposta:**
```json
{
  "response": "Baseado no documento carregado..."
}
```

### POST `/api/oraculo/chat/stream`
Chat com streaming em tempo real.

**Parâmetros:** Igual ao chat normal
**Resposta:** Stream de texto em tempo real

### POST `/api/oraculo/limpar-historico`
Limpa o histórico de uma sessão.

**Parâmetros:**
```json
{
  "sessionId": "session_123"
}
```

### GET `/api/oraculo/historico/:sessionId`
Obtém o histórico completo de uma sessão.

**Resposta:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Pergunta do usuário",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "role": "assistant", 
      "content": "Resposta do assistente",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ],
  "documentType": "Site",
  "provider": "Groq",
  "model": "llama-3.1-8b-instant"
}
```

### GET `/api/oraculo/sessoes`
Lista sessões ativas e conversas recentes.

## Exemplos de Uso

### 1. Inicializar com Site
```javascript
const response = await fetch('/api/oraculo/inicializar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provedor: 'Groq',
    modelo: 'llama-3.1-8b-instant',
    apiKey: 'sua_chave_aqui',
    tipoArquivo: 'Site',
    arquivo: 'https://example.com',
    sessionId: 'session_' + Date.now()
  })
});
```

### 2. Chat com Streaming
```javascript
const response = await fetch('/api/oraculo/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    message: 'Resuma o documento'
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  console.log(chunk); // Processa cada chunk
}
```

### 3. Upload de PDF
```javascript
const formData = new FormData();
formData.append('arquivo', pdfFile);
formData.append('provedor', 'Gemini');
formData.append('modelo', 'gemini-2.5-flash');
formData.append('apiKey', 'sua_chave');
formData.append('tipoArquivo', '.PDF');
formData.append('sessionId', 'session_pdf_123');

const response = await fetch('/api/oraculo/inicializar', {
  method: 'POST',
  body: formData
});
```

## Tratamento de Erros

Todos os endpoints retornam erros no formato:
```json
{
  "error": "Descrição do erro"
}
```

Códigos de status comuns:
- `400`: Parâmetros inválidos
- `404`: Sessão não encontrada
- `500`: Erro interno do servidor

## Considerações de Segurança

1. **API Keys**: Nunca exponha chaves de API no frontend
2. **Validação**: Todos os uploads são validados por tipo e tamanho
3. **Limpeza**: Arquivos temporários são automaticamente removidos
4. **Sessões**: Use IDs únicos e seguros para sessões

## Limitações

- Arquivos até 10MB
- 5 tentativas para carregamento de sites
- Tipos de arquivo suportados: PDF, CSV, TXT
- Sessões são perdidas se o servidor reiniciar (considere usar Redis para produção)