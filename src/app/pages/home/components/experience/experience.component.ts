import { Component } from '@angular/core';
import { CV_DATA } from '../../../../core/data/cv-data';

@Component({
  selector: 'app-experience',
  standalone: true,
  template: `
    <section class="py-20 relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal">
          <h2 class="font-display font-bold text-3xl sm:text-4xl mb-4">
            Experiencia <span class="gradient-text">Profesional</span>
          </h2>
        </div>

        <div class="relative">
          <!-- Desktop Timeline Line -->
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
               style="background: var(--border)"></div>

          <div class="space-y-12">
            @for (exp of experience; track exp.company; let idx = $index) {
              <div class="relative flex flex-col md:flex-row justify-between items-center w-full"
                   [class.reveal-left]="idx % 2 === 0"
                   [class.reveal-right]="idx % 2 !== 0"
                   [class.md:flex-row-reverse]="idx % 2 !== 0">
                
                <!-- Timeline Dot -->
                <div class="hidden md:block absolute left-1/2 top-8 -translate-x-1/2 w-4 h-4 rounded-full z-10"
                     style="background: var(--accent-gradient); box-shadow: var(--accent-glow)">
                </div>

                <!-- Content Card -->
                <div class="w-full md:w-[calc(50%-2rem)]">
                  <div class="glass p-6 md:p-8 hover:border-indigo-500/30 transition-colors duration-300">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 class="font-display font-bold text-xl">{{ exp.role }}</h3>
                        <div class="font-medium" style="color: var(--accent-indigo)">{{ exp.company }}</div>
                      </div>
                      <div class="text-sm font-mono px-3 py-1 rounded-full w-fit"
                           style="background: rgba(255,255,255,0.05); color: var(--text-secondary)">
                        {{ exp.period }}
                      </div>
                    </div>

                    <ul class="space-y-3 mb-6">
                      @for (highlight of exp.highlights; track highlight) {
                        <li class="flex items-start gap-3 text-sm md:text-base leading-relaxed" style="color: var(--text-secondary)">
                          <span class="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style="background: var(--accent-cyan)"></span>
                          <span>{{ highlight }}</span>
                        </li>
                      }
                    </ul>

                    <div class="flex flex-wrap gap-2">
                      @for (tag of exp.tags; track tag) {
                        <span class="text-xs font-mono font-medium" style="color: var(--text-muted)">
                          #{{ tag }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class ExperienceComponent {
  experience = CV_DATA.experience;
}
