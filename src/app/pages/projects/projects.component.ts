import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CV_DATA } from '../../core/data/cv-data';
import { ProjectCardComponent } from './components/project-card/project-card.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectCardComponent],
  template: `
    <div class="pt-28 pb-20 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="max-w-3xl mb-16 reveal">
          <h1 class="font-display font-bold text-4xl sm:text-5xl mb-6">
            Mis <span class="gradient-text">Proyectos</span>
          </h1>
          <p class="font-body text-lg sm:text-xl leading-relaxed" style="color: var(--text-secondary)">
            Explora mi portfolio de proyectos. Desde arquitecturas cloud y automatizaciones
            con IA, hasta interfaces de usuario modernas y optimizadas.
          </p>
        </div>

        <!-- Projects Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of projects; track project.id; let idx = $index) {
            <div class="reveal h-full" [style.transition-delay]="(idx * 50) + 'ms'">
              <app-project-card [project]="project"></app-project-card>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  projects = CV_DATA.projects;

  // Same reveal-on-scroll setup as HomeComponent — this route mounts on its
  // own (direct load or nav from Home), so it needs its own observer instead
  // of relying on one set up elsewhere.
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
        .forEach(el => this.observer?.observe(el));
    }, 100);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
