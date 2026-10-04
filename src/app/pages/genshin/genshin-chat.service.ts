import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { GenshinApiError } from './genshin-api.service';
import { ChatMessage, SseParser } from './genshin-chat';

@Injectable({ providedIn: 'root' })
export class GenshinChatService {
  /**
   * Streams the assistant's reply as text chunks. Uses fetch (not HttpClient)
   * because HttpClient can't expose a response body incrementally.
   */
  async *stream(messages: ChatMessage[], context: string, signal?: AbortSignal): AsyncGenerator<string> {
    let response: Response;
    try {
      response = await fetch(`${environment.apiUrl}/genshin/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, context }),
        signal,
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new GenshinApiError('No hay conexión con el servidor. Puede estar despertando, vuelve a intentarlo en un minuto.', 0);
    }
    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => null);
      throw new GenshinApiError(typeof body?.message === 'string' ? body.message : 'No se pudo iniciar el chat.', response.status);
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    const parser = new SseParser();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        for (const event of parser.push(value)) {
          if (event === '[DONE]') return;
          const data = JSON.parse(event) as { text?: string; error?: string };
          if (data.error) throw new GenshinApiError(data.error, 0);
          if (data.text) yield data.text;
        }
      }
    } finally {
      reader.cancel().catch(() => undefined);
    }
  }
}
