import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';

@Component({
  selector: 'app-hero-canvas',
  standalone: true,
  template: `<canvas #canvas class="absolute inset-0 w-full h-full -z-10 pointer-events-none"></canvas>`,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }
  `]
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ngZone = inject(NgZone);
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId = 0;
  private resizeObserver: ResizeObserver | null = null;
  
  private width = 0;
  private height = 0;
  
  private mouse = { x: -1000, y: -1000 };
  private time = 0;
  
  private readonly SPACING = 28;
  private readonly RADIUS = 1.5;
  private readonly FALLOFF = 120;
  
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: true });
    
    if (!this.ctx) return;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement || document.body);
    
    window.addEventListener('mousemove', this.onMouseMove);
    
    this.ngZone.runOutsideAngular(() => {
      this.render();
    });
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    
    canvas.width = this.width;
    canvas.height = this.height;
  }

  private render = (): void => {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += 0.02;

    const cols = Math.floor(this.width / this.SPACING) + 1;
    const rows = Math.floor(this.height / this.SPACING) + 1;
    
    const isMobile = window.innerWidth < 768;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * this.SPACING;
        const y = j * this.SPACING;
        
        let intensity = 0;
        
        if (isMobile) {
          // Random pulse based on position and time for mobile
          intensity = Math.max(0, Math.sin(x * 0.01 + this.time) * Math.cos(y * 0.01 + this.time)) * 0.8;
        } else {
          // Cursor reaction for desktop
          const dx = this.mouse.x - x;
          const dy = this.mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          intensity = Math.max(0, 1 - dist / this.FALLOFF);
        }

        const baseOpacity = 0.12;
        const opacity = baseOpacity + intensity * 0.75;
        
        // Interpolate between white and accent-cyan (#06B6D4) based on intensity
        const r = Math.round(255 - intensity * (255 - 6));
        const g = Math.round(255 - intensity * (255 - 182));
        const b = Math.round(255 - intensity * (255 - 212));
        
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(this.render);
  };
}
