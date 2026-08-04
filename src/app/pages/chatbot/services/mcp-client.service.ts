import { Injectable, signal } from '@angular/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class McpClientService {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  
  // State
  readonly isConnected = signal(false);
  readonly isProcessing = signal(false);
  readonly sessionId = signal<string>(crypto.randomUUID());
  readonly messages = signal<ChatMessage[]>([]);
  readonly pdfUploaded = signal(false);
  readonly pdfFilename = signal<string | null>(null);

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      this.transport = new SSEClientTransport(
        new URL(`${environment.apiUrl}/sse`)
      );

      this.client = new Client({
        name: 'portfolio-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await this.client.connect(this.transport);
      this.isConnected.set(true);
      console.log('Connected to MCP Server');

    } catch (error) {
      console.error('Failed to connect to MCP Server:', error);
      this.isConnected.set(false);
      // Reconnect logic could go here
    }
  }

  async uploadPdf(file: File) {
    if (!this.client || !this.isConnected()) throw new Error('Not connected');
    
    this.isProcessing.set(true);
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const result = await this.client.callTool({
        name: 'upload_pdf',
        arguments: {
          session_id: this.sessionId(),
          pdf_base64: base64,
          filename: file.name
        }
      });
      
      this.pdfUploaded.set(true);
      this.pdfFilename.set(file.name);
      
      // Add system message
      this.addMessage('bot', `He procesado el archivo **${file.name}**. ¡Pregúntame lo que quieras sobre él!`);
      
      return result;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    } finally {
      this.isProcessing.set(false);
    }
  }

  async sendMessage(content: string) {
    if (!this.client || !this.isConnected()) throw new Error('Not connected');
    if (!content.trim()) return;

    // Add user message
    this.addMessage('user', content);
    this.isProcessing.set(true);

    try {
      const result = await this.client.callTool({
        name: 'query_rag',
        arguments: {
          session_id: this.sessionId(),
          query: content
        }
      });

      // The result from MCP tool is an object with content array
      // e.g. { content: [{ type: 'text', text: 'response...' }] }
      let botResponse = '';
      if (result.content && Array.isArray(result.content)) {
        const textParts = result.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text);
        botResponse = textParts.join('\\n');
      }

      this.addMessage('bot', botResponse || 'No recibí respuesta.');

    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('bot', 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  clearSession() {
    this.messages.set([]);
    this.pdfUploaded.set(false);
    this.pdfFilename.set(null);
    this.sessionId.set(crypto.randomUUID());
    
    // Optionally call clear_session tool
    if (this.client && this.isConnected()) {
      this.client.callTool({
        name: 'clear_session',
        arguments: { session_id: this.sessionId() }
      }).catch(console.error);
    }
  }

  private addMessage(role: 'user' | 'bot', content: string) {
    this.messages.update(msgs => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
        status: 'success'
      }
    ]);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}
