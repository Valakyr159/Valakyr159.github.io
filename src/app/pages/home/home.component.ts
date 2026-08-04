import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { EducationComponent } from './components/education/education.component';
import { ProjectsPreviewComponent } from './components/projects-preview/projects-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    EducationComponent,
    ProjectsPreviewComponent
  ],
  template: `
    <div class="flex flex-col gap-8 md:gap-16 pb-24">
      <app-hero id="hero"></app-hero>
      
      <!-- Content wrapper with subtle animated background -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent dark:via-indigo-900/10 pointer-events-none -z-10"></div>
        
        <app-about id="about"></app-about>
        <app-skills id="skills"></app-skills>
        <app-experience id="experience"></app-experience>
        <app-education id="education"></app-education>
        <app-projects-preview id="projects"></app-projects-preview>
      </div>
    </div>
  `
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    // Setup Scroll Reveal Animation Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: Stop observing once revealed
          // this.observer?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    // Observe all elements with reveal classes
    setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      revealElements.forEach(el => this.observer?.observe(el));
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
