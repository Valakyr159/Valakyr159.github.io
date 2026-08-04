import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CV_DATA } from '../../../../core/data/cv-data';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal">
          <h2 class="font-display font-bold text-3xl sm:text-4xl mb-4">
            Stack <span class="gradient-text">Técnico</span>
          </h2>
          <p class="font-body text-lg max-w-2xl mx-auto" style="color: var(--text-secondary)">
            Tecnologías y herramientas que utilizo para construir soluciones de nivel world-class.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (category of skillCategories; track category.name; let idx = $index) {
            <div class="glass p-6 reveal transition-transform hover:-translate-y-2 duration-300"
                 [style.transition-delay]="(idx * 80) + 'ms'">
              
              <!-- Header -->
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5"
                     [style.color]="'var(' + category.accentVar + ')'">
                  <ng-container [ngSwitch]="category.icon">
                    <!-- Frontend Icon -->
                    <svg *ngSwitchCase="'layers'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>
                    <!-- Backend Icon -->
                    <svg *ngSwitchCase="'server'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                    <!-- AI Icon -->
                    <svg *ngSwitchCase="'brain'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>
                    <!-- Cloud Icon -->
                    <svg *ngSwitchCase="'cloud'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                    <!-- DB Icon -->
                    <svg *ngSwitchDefault xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
                  </ng-container>
                </div>
                <h3 class="font-display font-semibold text-xl">{{ category.name }}</h3>
              </div>

              <!-- Skills Chips -->
              <div class="flex flex-wrap gap-2">
                @for (skill of category.skills; track skill) {
                  <span class="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-default"
                        [style.background]="'rgba(255,255,255,0.03)'"
                        [style.border]="'1px solid var(--border)'"
                        [style.color]="'var(--text-primary)'"
                        onmouseover="this.style.borderColor='var(--accent-indigo)'"
                        onmouseout="this.style.borderColor='var(--border)'">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {
  skillCategories = CV_DATA.skills;
}
