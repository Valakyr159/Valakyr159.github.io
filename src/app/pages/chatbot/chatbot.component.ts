import { Component, ElementRef, ViewChild, AfterViewChecked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpClientService } from './services/mcp-client.service';
import { PdfDropzoneComponent } from './components/pdf-dropzone/pdf-dropzone.component';
import { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfDropzoneComponent, MessageBubbleComponent],
  template: `
    <div class="pt-20 min-h-screen flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50 dark:bg-[#060B18]">
      
      <!-- Header -->
      <div class="flex-shrink-0 border-b px-4 py-3 bg-white/50 dark:bg-[#0E1A2E]/50 backdrop-blur-md" style="border-color: var(--border)">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="font-display font-bold text-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-indigo)"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              {{ i18n.t().chatbot.title }} <span class="gradient-text">RAG</span>
            </h1>
            <p class="text-xs" style="color: var(--text-secondary)">
              {{ i18n.t().chatbot.subtitle }}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                  [class]="mcp.isConnected() ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'">
              <span class="w-1.5 h-1.5 rounded-full" [class]="mcp.isConnected() ? 'bg-green-500' : 'bg-red-500'"></span>
              {{ mcp.isConnected() ? i18n.t().chatbot.connected : i18n.t().chatbot.disconnected }}
            </span>
            
            <button *ngIf="mcp.pdfUploaded()" 
                    (click)="resetSession()"
                    class="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    style="color: var(--text-secondary); border-color: var(--border)">
              {{ i18n.t().chatbot.clearSession }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-4 overflow-hidden">
        
        <!-- Left Panel: PDF Management -->
        <div class="w-full lg:w-1/3 flex flex-col gap-4">
          <div class="glass flex-1 rounded-2xl p-6 flex flex-col">
            <h2 class="font-display font-semibold text-lg mb-4">{{ i18n.t().chatbot.docContext }}</h2>
            
            @if (!mcp.pdfUploaded()) {
              <div class="flex-1 flex items-center justify-center">
                @if (mcp.isProcessing()) {
                  <div class="flex flex-col items-center justify-center gap-4 text-center w-full">
                    <div class="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                    <p class="font-medium text-sm animate-pulse" style="color: var(--accent-indigo)">
                      {{ i18n.t().chatbot.processing }}<br>
                      <span class="text-xs font-normal" style="color: var(--text-muted)">{{ i18n.t().chatbot.processingSub }}</span>
                    </p>
                  </div>
                } @else {
                  <app-pdf-dropzone (fileSelected)="onFileSelected($event)" class="w-full"></app-pdf-dropzone>
                }
              </div>
            } @else {
              <!-- PDF Uploaded State -->
              <div class="flex flex-col items-center justify-center flex-1 text-center">
                <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                </div>
                <h3 class="font-medium text-lg mb-1" style="color: var(--text-primary)">
                  {{ i18n.t().chatbot.docLoaded }}
                </h3>
                <p class="text-sm px-4 py-2 rounded-lg break-all" style="background: rgba(255,255,255,0.05); color: var(--text-secondary)">
                  {{ mcp.pdfFilename() }}
                </p>
                
                <div class="mt-6 p-4 rounded-xl text-sm text-left border" style="background: rgba(99, 102, 241, 0.05); border-color: var(--border); color: var(--text-secondary)">
                  <div class="flex items-center gap-2 font-medium mb-2" style="color: var(--accent-indigo)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {{ i18n.t().chatbot.info }}
                  </div>
                  {{ i18n.t().chatbot.infoDesc }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right Panel: Chat -->
        <div class="w-full lg:w-2/3 flex flex-col glass rounded-2xl overflow-hidden">
          
          <!-- Chat Messages Area -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" #chatContainer>
            
            @if (mcp.messages().length === 0) {
              <!-- Empty State -->
              <div class="h-full flex flex-col items-center justify-center text-center px-4">
                <div class="w-20 h-20 mb-6 opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-violet)"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <h3 class="font-display font-semibold text-xl mb-2">{{ i18n.t().chatbot.helloTitle }}</h3>
                <p class="max-w-md text-sm mb-8" style="color: var(--text-secondary)">
                  {{ i18n.t().chatbot.helloDesc }}
                </p>
                
                @if (mcp.pdfUploaded()) {
                  <div class="flex flex-wrap justify-center gap-2">
                    <button *ngFor="let prompt of suggestedPrompts()"
                            (click)="sendSuggested(prompt)"
                            class="px-4 py-2 rounded-full text-sm border transition-colors hover:bg-white/5"
                            style="background: var(--bg-elevated); border-color: var(--border); color: var(--text-primary)">
                      {{ prompt }}
                    </button>
                  </div>
                }
              </div>
            } @else {
              @for (msg of mcp.messages(); track msg.id) {
                <app-message-bubble [message]="msg"></app-message-bubble>
              }
              
              @if (mcp.isProcessing() && mcp.messages()[mcp.messages().length - 1].role !== 'bot') {
                <div class="flex w-full">
                  <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-1 shadow-md"
                       style="background: var(--accent-gradient)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <div class="rounded-2xl px-5 py-3 shadow-sm border" style="background: var(--bg-elevated); border-color: var(--border)">
                    <div class="flex items-center gap-1.5 h-6">
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Chat Input -->
          <div class="p-4 bg-white/5 dark:bg-black/20 border-t backdrop-blur-sm" style="border-color: var(--border)">
            <form (ngSubmit)="sendMessage()" class="relative flex items-end gap-2 max-w-4xl mx-auto">
              <textarea
                #inputArea
                [(ngModel)]="userInput"
                name="userInput"
                rows="1"
                [placeholder]="i18n.t().chatbot.inputPlaceholder"
                class="w-full bg-transparent border rounded-2xl px-4 py-3.5 outline-none resize-none overflow-hidden transition-colors focus:border-indigo-500 disabled:opacity-50"
                style="background: var(--bg-surface); border-color: var(--border); color: var(--text-primary)"
                (input)="autoResize(inputArea)"
                (keydown.enter)="onEnter($event)"
                [disabled]="!mcp.pdfUploaded() || mcp.isProcessing() || !mcp.isConnected()"
              ></textarea>
              
              <button 
                type="submit"
                [disabled]="!userInput.trim() || !mcp.pdfUploaded() || mcp.isProcessing() || !mcp.isConnected()"
                class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95"
                style="background: var(--accent-gradient)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
            
            <div class="text-center mt-2 text-[10px]" style="color: var(--text-muted)">
              <span *ngIf="!mcp.isConnected()">{{ i18n.t().chatbot.connectingText }}</span>
              <span *ngIf="mcp.isConnected() && !mcp.pdfUploaded()">Sube un PDF primero para empezar a preguntar.</span>
              <span *ngIf="mcp.pdfUploaded()">Presiona Enter para enviar, Shift+Enter para nueva línea.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  mcp = inject(McpClientService);
  i18n = inject(I18nService);
  userInput = '';
  
  suggestedPrompts = computed(() => this.i18n.t().chatbot.prompts);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onFileSelected(file: File) {
    this.mcp.uploadPdf(file).catch(() => {
      alert('Error al subir el archivo. Asegúrate de que el backend esté ejecutándose.');
    });
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.mcp.pdfUploaded() || this.mcp.isProcessing()) return;
    
    const msg = this.userInput;
    this.userInput = '';
    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
    
    this.mcp.sendMessage(msg);
  }

  onEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendSuggested(prompt: string) {
    this.userInput = prompt;
    this.sendMessage();
  }

  resetSession() {
    if (confirm('¿Estás seguro de que deseas limpiar la sesión actual? Se borrará el PDF y el historial de chat.')) {
      this.mcp.clearSession();
    }
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
