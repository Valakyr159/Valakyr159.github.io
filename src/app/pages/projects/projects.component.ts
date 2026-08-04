import { Component, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CV_DATA, Project } from '../../core/data/cv-data';
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

        <!-- Filter tabs -->
        <div class="flex flex-wrap gap-3 mb-12 reveal">
          @for (filter of filters; track filter.id) {
            <button (click)="activeFilter.set(filter.id)"
                    class="px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300"
                    [class]="activeFilter() === filter.id 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'">
              {{ filter.label }}
            </button>
          }
        </div>

        <!-- Projects Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of filteredProjects(); track project.id; let idx = $index) {
            <div class="reveal h-full" [style.transition-delay]="(idx * 50) + 'ms'">
              <app-project-card [project]="project"></app-project-card>
            </div>
          }
          
          @if (filteredProjects().length === 0) {
            <div class="col-span-full py-20 text-center glass rounded-2xl">
              <p style="color: var(--text-secondary)">No hay proyectos en esta categoría todavía.</p>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  projects = CV_DATA.projects;
  activeFilter = signal<string>('all');

  filters = [
    { id: 'all', label: 'Todos los Proyectos' },
    { id: 'ai-ml', label: 'AI & Machine Learning' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'frontend', label: 'Frontend' }
  ];

  filteredProjects() {
    const filter = this.activeFilter();
    if (filter === 'all') return this.projects;
    return this.projects.filter((p: Project) => p.category === filter);
  }

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
