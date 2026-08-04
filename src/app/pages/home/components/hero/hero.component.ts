import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CV_DATA } from '../../../../core/data/cv-data';
import { HeroCanvasComponent } from '../hero-canvas/hero-canvas.component';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, HeroCanvasComponent],
  template: `
    <section class="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <!-- Background Canvas -->
      <app-hero-canvas />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-3xl">
          <!-- Availability Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-8 reveal">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {{ i18n.t().home.available }}
          </div>

          <!-- Name & Role -->
          <h1 class="font-display font-bold text-5xl sm:text-6xl md:text-7xl tracking-tight mb-4 reveal">
            <span class="gradient-text">{{ name }}</span>
          </h1>
          
          <div class="h-10 sm:h-12 md:h-14 mb-6 reveal">
            <h2 class="font-display font-semibold text-2xl sm:text-3xl md:text-4xl" style="color: var(--text-secondary)">
              {{ currentRole() }}<span class="typewriter-cursor"></span>
            </h2>
          </div>

          <!-- Description -->
          <p class="font-body text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl reveal" style="color: var(--text-muted)">
            {{ i18n.t().home.description }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 mb-12 reveal">
            <a routerLink="/projects" 
               class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02]"
               style="background: var(--accent-gradient); box-shadow: var(--accent-glow)">
              {{ i18n.t().home.viewProjects }}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            
            <a href="/cv.pdf" download="Javier_Moron_CV.pdf"
               class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group"
               style="color: var(--text-primary); border: 1px solid var(--accent-indigo)">
              <div class="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                   style="background: var(--accent-gradient)"></div>
              {{ i18n.t().home.downloadCV }}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </a>
          </div>

          <!-- Social Links -->
          <div class="flex items-center gap-6 reveal">
            <a [href]="github" target="_blank" rel="noopener noreferrer" 
               class="transition-colors hover:text-white" style="color: var(--text-secondary)"
               aria-label="GitHub Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a [href]="linkedin" target="_blank" rel="noopener noreferrer"
               class="transition-colors hover:text-white" style="color: var(--text-secondary)"
               aria-label="LinkedIn Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-bounce reveal">
        <span class="text-xs font-medium tracking-widest uppercase" style="color: var(--text-secondary)">Scroll</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary)"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);
  readonly name = CV_DATA.personal.fullName;
  
  // Update roles based on language
  readonly roles = computed(() => {
    return this.i18n.currentLang() === 'en' 
      ? ['Full Stack Engineer', 'Machine Learning Engineer', 'AI Solutions Architect', 'Cloud Integrator']
      : CV_DATA.typewriterRoles;
  });

  readonly github = CV_DATA.personal.github;
  readonly linkedin = CV_DATA.personal.linkedin;

  currentRole = signal('');
  
  private roleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: any;

  ngOnInit(): void {
    this.typewriterEffect();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private typewriterEffect(): void {
    const roleList = this.roles();
    
    // Ensure roleIndex is within bounds if language changes
    if (this.roleIndex >= roleList.length) {
      this.roleIndex = 0;
    }
    
    const role = roleList[this.roleIndex];
    
    if (this.isDeleting) {
      this.currentRole.set(role.substring(0, this.charIndex - 1));
      this.charIndex--;
    } else {
      this.currentRole.set(role.substring(0, this.charIndex + 1));
      this.charIndex++;
    }

    let typeSpeed = 80; // Speed of typing
    if (this.isDeleting) typeSpeed = 40; // Speed of deleting

    if (!this.isDeleting && this.charIndex === role.length) {
      // Pause at end
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.roleIndex = (this.roleIndex + 1) % roleList.length;
      typeSpeed = 500; // Pause before typing next word
    }

    this.timeoutId = setTimeout(() => this.typewriterEffect(), typeSpeed);
  }
}
