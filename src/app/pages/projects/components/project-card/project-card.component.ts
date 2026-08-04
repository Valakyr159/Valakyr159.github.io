import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Project } from '../../../../core/data/cv-data';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="project-card glass h-full flex flex-col"
         [class.md:col-span-2]="project.featured">
      
      <!-- Card Header: Status & Date -->
      <div class="flex items-center justify-between p-5 border-b" style="border-color: var(--border)">
        @if (project.status === 'live') {
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/30 bg-green-500/10 text-green-400">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            En vivo
          </span>
        } @else if (project.status === 'completed') {
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400">
            Completado <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
        } @else {
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400">
            En desarrollo
          </span>
        }
        
        <span class="text-sm font-mono" style="color: var(--text-muted)">{{ project.date }}</span>
      </div>

      <!-- Banner -->
      <div class="h-48 w-full relative overflow-hidden flex items-center justify-center"
           [style.background]="project.image ? null : getBannerGradient(project.category)">

        @if (project.image) {
          <img [src]="project.image" [alt]="project.title + ' — captura de pantalla'"
               class="absolute inset-0 w-full h-full object-cover object-top">
          <div class="absolute inset-0" style="background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%)"></div>
        } @else {
          <!-- Animated Shimmer for Featured -->
          @if (project.featured) {
            <div class="absolute inset-0 w-[200%] animate-[shimmer_2s_infinite] opacity-30"
                 style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"></div>
          }

          <!-- Category Icon -->
          <div class="relative z-10 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
            <ng-container [ngSwitch]="project.category">
              <!-- AI Icon -->
              <svg *ngSwitchCase="'ai-ml'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>
              <!-- Full Stack Icon -->
              <svg *ngSwitchCase="'fullstack'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <!-- Frontend Icon -->
              <svg *ngSwitchCase="'frontend'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </ng-container>
          </div>
        }
      </div>

      <!-- Content -->
      <div class="p-6 flex-1 flex flex-col">
        <div class="flex items-start justify-between gap-4 mb-3">
          <h3 class="font-display font-bold text-xl leading-tight">{{ project.title }}</h3>
          @if (project.featured) {
            <span class="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white shadow-sm"
                  style="background: var(--accent-gradient)">
              ⚡ Destacado
            </span>
          }
        </div>
        
        <p class="font-body text-sm leading-relaxed mb-6" style="color: var(--text-secondary)">
          {{ project.description }}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t" style="border-color: var(--border)">
          @for (tag of project.tags.slice(0, 4); track tag) {
            <span class="text-xs font-mono px-2.5 py-1 rounded-md"
                  style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted)">
              {{ tag }}
            </span>
          }
          @if (project.tags.length > 4) {
            <span class="text-xs font-mono px-2.5 py-1 rounded-md"
                  style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted)">
              +{{ project.tags.length - 4 }}
            </span>
          }
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 bg-black/20 border-t flex gap-3" style="border-color: var(--border)">
        @if (project.route) {
          <a [routerLink]="project.route" 
             class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
             style="background: var(--accent-gradient); box-shadow: var(--accent-glow)">
            Abrir App
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        }
        
        @if (project.github) {
          <a [href]="project.github" target="_blank" rel="noopener noreferrer"
             class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors hover:bg-white/5"
             style="color: var(--text-primary); border: 1px solid var(--border)">
            GitHub
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        }
        
        @if (project.demo && !project.route) {
          <a [href]="project.demo" target="_blank" rel="noopener noreferrer"
             class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors hover:bg-white/5"
             style="color: var(--text-primary); border: 1px solid var(--border)">
            Abrir App
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      100% { transform: translateX(50%); }
    }
  `]
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;

  getBannerGradient(category: string): string {
    switch (category) {
      case 'ai-ml':
        return 'linear-gradient(135deg, #4338ca 0%, #8b5cf6 50%, #06b6d4 100%)';
      case 'fullstack':
        return 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)';
      case 'frontend':
        return 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)';
      default:
        return 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
    }
  }
}
