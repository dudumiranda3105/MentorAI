import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export class ChatProviders {
  constructor() {
    this.providers = {
      'Groq': {
        modelos: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
        chat: this.createGroqChat
      },
      'Gemini': {
        modelos: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
        chat: this.createGeminiChat
      }
    };
  }

  createGroqChat(modelo, apiKey) {
    const groq = new Groq({
      apiKey: apiKey
    });

    return {
      stream: async function* ({ input, chatHistory, systemMessage }) {
        const messages = [
          { role: 'system', content: systemMessage },
          ...chatHistory,
          { role: 'user', content: input }
        ];

        const stream = await groq.chat.completions.create({
          messages: messages,
          model: modelo,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            yield content;
          }
        }
      },

      invoke: async function ({ input, chatHistory, systemMessage }) {
        const messages = [
          { role: 'system', content: systemMessage },
          ...chatHistory,
          { role: 'user', content: input }
        ];

        const completion = await groq.chat.completions.create({
          messages: messages,
          model: modelo,
        });

        return completion.choices[0].message.content;
      }
    };
  }

  createGeminiChat(modelo, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelo });

    return {
      stream: async function* ({ input, chatHistory, systemMessage }) {
        // Converte o histórico para o formato do Gemini
        const history = chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));
        // systemInstruction precisa ser um objeto Content com parts, não string
        let chat;
        try {
          chat = model.startChat({
            history,
            systemInstruction: {
              parts: [{ text: systemMessage.substring(0, 2000) }]
            }
          });
        } catch (e) {
          console.warn('⚠️ Falha ao aplicar systemInstruction. Tentando sem systemInstruction.', e.message);
          chat = model.startChat({ history });
        }

        const result = await chat.sendMessageStream(input);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            yield chunkText;
          }
        }
      },

      invoke: async function ({ input, chatHistory, systemMessage }) {
        const history = chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));
        let chat;
        try {
          chat = model.startChat({
            history,
            systemInstruction: {
              parts: [{ text: systemMessage.substring(0, 2000) }]
            }
          });
        } catch (e) {
          console.warn('⚠️ Falha ao aplicar systemInstruction (invoke). Usando sem systemInstruction.', e.message);
          chat = model.startChat({ history });
        }

        const result = await chat.sendMessage(input);
        return result.response.text();
      }
    };
  }

  getProvider(providerName) {
    return this.providers[providerName];
  }

  getProviders() {
    return Object.keys(this.providers);
  }

  getModels(providerName) {
    return this.providers[providerName]?.modelos || [];
  }
}