import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { marked } from 'marked';
import { ChatMessage } from '../../services/mcp-client.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="flex w-full message-animate" [class.justify-end]="message.role === 'user'">
      
      @if (message.role === 'bot') {
        <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1 shadow-md"
             style="background: var(--accent-gradient)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
      }

      <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm relative group"
           [class.user-bubble]="message.role === 'user'"
           [class.bot-bubble]="message.role === 'bot'">
        
        @if (message.status === 'sending') {
          <div class="flex items-center gap-1.5 h-6">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        } @else {
          <!-- Markdown Content -->
          <div class="markdown-body font-body text-[15px] leading-relaxed" 
               [innerHTML]="parsedContent"
               [class.text-white]="message.role === 'user'">
          </div>
        }
        
        <!-- Timestamp -->
        <div class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-3"
             [class.text-indigo-200]="message.role === 'user'"
             [class.text-gray-400]="message.role === 'bot'">
          {{ message.timestamp | date:'shortTime' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-bubble {
      background: var(--accent-gradient);
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .bot-bubble {
      background: var(--bg-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-bottom-left-radius: 4px;
    }

    /* Markdown Overrides */
    ::ng-deep .markdown-body p {
      margin-bottom: 0.5em;
    }
    ::ng-deep .markdown-body p:last-child {
      margin-bottom: 0;
    }
    ::ng-deep .markdown-body pre {
      background: rgba(0,0,0,0.3) !important;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 0.5rem 0;
      overflow-x: auto;
    }
    ::ng-deep .markdown-body code {
      background: rgba(0,0,0,0.2);
      padding: 0.1rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }
    ::ng-deep .markdown-body ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-bottom: 0.5rem;
    }
    ::ng-deep .markdown-body ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
      margin-bottom: 0.5rem;
    }
    ::ng-deep .user-bubble .markdown-body a {
      color: white;
      text-decoration: underline;
    }
    ::ng-deep .bot-bubble .markdown-body a {
      color: var(--accent-indigo);
      text-decoration: underline;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class MessageBubbleComponent {
  @Input({ required: true }) message!: ChatMessage;

  get parsedContent(): string {
    if (!this.message.content) return '';
    try {
      // marked.parse returns a Promise in some configs or string in others.
      // We use marked.parse as string since marked@12+ it's synchronous if no async extensions.
      return marked.parse(this.message.content) as string;
    } catch (e) {
      return this.message.content;
    }
  }
}
