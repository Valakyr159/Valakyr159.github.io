import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, computed } from '@angular/core';
import { CV_DATA } from '../../../../core/data/cv-data';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- Text content -->
          <div class="reveal-left">
            <h2 class="font-display font-bold text-3xl sm:text-4xl mb-6">
              {{ i18n.t().about.title }}
            </h2>
            <div class="space-y-4 font-body text-lg leading-relaxed" style="color: var(--text-secondary)">
              <p>{{ i18n.t().about.p1 }}</p>
              <p>{{ i18n.t().about.p2 }}</p>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="glass p-8 reveal-right" #statsContainer>
            <div class="grid grid-cols-2 gap-8">
              <div class="text-center p-4 rounded-xl transition-colors hover:bg-white/5 dark:hover:bg-black/20">
                <div class="font-display font-bold text-5xl mb-2 gradient-text">
                  {{ displayExperience }}+
                </div>
                <div class="font-medium" style="color: var(--text-secondary)">{{ i18n.t().about.stats.years }}</div>
              </div>
              
              <div class="text-center p-4 rounded-xl transition-colors hover:bg-white/5 dark:hover:bg-black/20">
                <div class="font-display font-bold text-5xl mb-2 gradient-text">
                  {{ displayTechs }}+
                </div>
                <div class="font-medium" style="color: var(--text-secondary)">{{ i18n.t().about.stats.tech }}</div>
              </div>
              
              <div class="text-center p-4 rounded-xl transition-colors hover:bg-white/5 dark:hover:bg-black/20">
                <div class="font-display font-bold text-5xl mb-2 gradient-text">
                  {{ displayProjects }}+
                </div>
                <div class="font-medium" style="color: var(--text-secondary)">{{ i18n.t().about.stats.projects }}</div>
              </div>
              
              <div class="text-center p-4 rounded-xl transition-colors hover:bg-white/5 dark:hover:bg-black/20">
                <div class="font-display font-bold text-5xl mb-2 gradient-text">
                  100+
                </div>
                <div class="font-medium" style="color: var(--text-secondary)">{{ i18n.t().about.stats.courses }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('statsContainer') statsContainer!: ElementRef;
  i18n = inject(I18nService);

  // Target stats
  private targetExperience = 2; // Derived from CV (2022-2026 roughly)
  private targetTechs = CV_DATA.skills.reduce((acc, cat) => acc + cat.skills.length, 0);
  private targetProjects = CV_DATA.projects.length;
  
  // Display stats
  displayExperience = 0;
  displayTechs = 0;
  displayProjects = 0;

  private observer: IntersectionObserver | null = null;
  private animated = false;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.animated) {
        this.animated = true;
        this.animateStats();
      }
    }, { threshold: 0.5 });
    
    this.observer.observe(this.statsContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private animateStats(): void {
    this.animateValue('displayExperience', this.targetExperience, 1500);
    this.animateValue('displayTechs', this.targetTechs, 2000);
    this.animateValue('displayProjects', this.targetProjects, 1500);
  }

  private animateValue(prop: 'displayExperience' | 'displayTechs' | 'displayProjects', target: number, duration: number): void {
    let start = 0;
    const increment = target / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start >= target) {
        this[prop] = target;
      } else {
        this[prop] = Math.ceil(start);
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}
