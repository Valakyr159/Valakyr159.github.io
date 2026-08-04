import { Component } from '@angular/core';
import { CV_DATA } from '../../../../core/data/cv-data';

@Component({
  selector: 'app-education',
  standalone: true,
  template: `
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal">
          <h2 class="font-display font-bold text-3xl sm:text-4xl mb-4">
            Educación y <span class="gradient-text">Formación</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          @for (edu of education; track edu.title; let idx = $index) {
            <div class="glass p-6 md:p-8 flex flex-col h-full reveal" [style.transition-delay]="(idx * 100) + 'ms'">
              <div class="flex items-start justify-between gap-4 mb-4">
                <h3 class="font-display font-bold text-lg md:text-xl">{{ edu.title }}</h3>
                
                @if (edu.status === 'completed') {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/30 bg-green-500/10 text-green-400 whitespace-nowrap">
                    Completado <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400 whitespace-nowrap">
                    En curso <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  </span>
                }
              </div>
              
              <div class="font-medium mb-2" style="color: var(--accent-indigo)">{{ edu.institution }}</div>
              <div class="text-sm font-mono mb-4" style="color: var(--text-muted)">{{ edu.period }}</div>
              
              <p class="text-sm leading-relaxed mt-auto" style="color: var(--text-secondary)">
                {{ edu.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class EducationComponent {
  education = CV_DATA.education;
}
