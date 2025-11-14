import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import csv from 'csv-parser';
import { YoutubeTranscript } from 'youtube-transcript';

export class DocumentLoaders {
  static async carregaSites(url) {
    let documentos = '';
    
    for (let i = 0; i < 5; i++) {
      try {
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': randomUserAgent
          },
          timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Remove scripts e estilos
        $('script, style, nav, footer, aside').remove();
        
        // Extrai o texto principal
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        
        if (text && text.length > 100) {
          documentos = text;
          break;
        }
      } catch (error) {
        console.log(`Erro ao carregar o site ${i + 1}:`, error.message);
        if (i === 4) {
          throw new Error('Não foi possível carregar o site após 5 tentativas');
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return documentos;
  }

  static async carregaYoutube(videoUrl) {
    try {
      // Extrai o ID do vídeo da URL
      const videoId = this.extractVideoId(videoUrl);
      
      if (!videoId) {
        throw new Error('URL do YouTube inválida');
      }
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'pt',
        country: 'BR'
      });
      
      const documentos = transcript.map(item => item.text).join(' ');
      return documentos;
    } catch (error) {
      console.error('Erro ao carregar transcrição do YouTube:', error);
      throw new Error('Não foi possível carregar a transcrição do vídeo');
    }
  }

  static extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  static async carregaPdf(caminhoArquivo) {
    try {
      const dataBuffer = fs.readFileSync(caminhoArquivo);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      throw new Error('Não foi possível carregar o arquivo PDF');
    }
  }

  static async carregaCsv(caminhoArquivo) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(caminhoArquivo)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          const documentos = results.map(row => 
            Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')
          ).join('\n');
          resolve(documentos);
        })
        .on('error', (error) => {
          console.error('Erro ao carregar CSV:', error);
          reject(new Error('Não foi possível carregar o arquivo CSV'));
        });
    });
  }

  static async carregaTxt(caminhoArquivo) {
    try {
      const data = fs.readFileSync(caminhoArquivo, 'utf8');
      return data;
    } catch (error) {
      console.error('Erro ao carregar TXT:', error);
      throw new Error('Não foi possível carregar o arquivo TXT');
    }
  }
}