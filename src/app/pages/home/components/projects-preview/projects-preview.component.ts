import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CV_DATA } from '../../../../core/data/cv-data';
import { ProjectCardComponent } from '../../../projects/components/project-card/project-card.component';

@Component({
  selector: 'app-projects-preview',
  standalone: true,
  imports: [RouterLink, ProjectCardComponent],
  template: `
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12 reveal">
          <div>
            <h2 class="font-display font-bold text-3xl sm:text-4xl mb-4">
              Proyectos <span class="gradient-text">Destacados</span>
            </h2>
            <p class="font-body text-lg" style="color: var(--text-secondary)">
              Una selección de mis mejores trabajos recientes.
            </p>
          </div>
          
          <a routerLink="/projects" 
             class="inline-flex items-center gap-2 font-medium hover:underline transition-all"
             style="color: var(--accent-indigo)">
            Ver todos los proyectos
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of featuredProjects; track project.id; let idx = $index) {
            <div class="reveal" [style.transition-delay]="(idx * 100) + 'ms'">
              <app-project-card [project]="project"></app-project-card>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProjectsPreviewComponent {
  // Get top 3 projects to display in preview
  featuredProjects = CV_DATA.projects.slice(0, 3);
}
