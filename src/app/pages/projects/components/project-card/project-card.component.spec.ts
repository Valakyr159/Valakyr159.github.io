import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectCardComponent } from './project-card.component';
import { Project } from '../../../../core/data/cv-data';

const baseProject: Project = {
  id: 'test-project',
  title: 'Test Project',
  description: 'A project used only for testing.',
  tags: ['Angular', 'TypeScript', 'Tailwind', 'Vitest', 'Extra'],
  category: 'fullstack',
  status: 'live',
  featured: false,
  route: '/projects/test',
  github: 'https://github.com/valakyr159/test-project',
  date: '2026',
};

describe('ProjectCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProjectCardComponent);
    fixture.componentInstance.project = baseProject;
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title, description and up to 4 tags plus an overflow badge', () => {
    const fixture = TestBed.createComponent(ProjectCardComponent);
    fixture.componentInstance.project = baseProject;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Test Project');
    expect(text).toContain('A project used only for testing.');
    expect(text).toContain('+1');
  });

  it('shows a GitHub link when project.github is set', () => {
    const fixture = TestBed.createComponent(ProjectCardComponent);
    fixture.componentInstance.project = baseProject;
    fixture.detectChanges();
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a')
    );

    expect(links.some(a => a.getAttribute('href') === baseProject.github)).toBe(true);
  });

  it('getBannerGradient() returns a distinct gradient per category', () => {
    const fixture = TestBed.createComponent(ProjectCardComponent);
    const component = fixture.componentInstance;

    const aiGradient = component.getBannerGradient('ai-ml');
    const fullstackGradient = component.getBannerGradient('fullstack');
    const unknownGradient = component.getBannerGradient('unknown');

    expect(aiGradient).not.toBe(fullstackGradient);
    expect(unknownGradient).not.toBe(aiGradient);
  });
});
