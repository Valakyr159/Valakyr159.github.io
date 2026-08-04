import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-pdf-dropzone',
  standalone: true,
  template: `
    <div
      class="dropzone group relative flex flex-col items-center justify-center min-h-[240px]"
      [class.drag-over]="isDragging"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input
        type="file"
        #fileInput
        class="hidden"
        accept="application/pdf"
        (change)="onFileSelected($event)"
      />
      
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1"
           style="background: rgba(99, 102, 241, 0.1); color: var(--accent-indigo)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
      </div>

      <h3 class="font-display font-semibold text-lg mb-2" style="color: var(--text-primary)">
        Sube un PDF
      </h3>
      <p class="font-body text-sm text-center max-w-[200px]" style="color: var(--text-secondary)">
        Arrastra y suelta aquí, o haz clic para seleccionar un archivo.
      </p>
    </div>
  `
})
export class PdfDropzoneComponent {
  @Output() fileSelected = new EventEmitter<File>();
  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        this.fileSelected.emit(file);
      } else {
        alert('Por favor, sube únicamente archivos PDF.');
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.fileSelected.emit(file);
      }
    }
  }
}
