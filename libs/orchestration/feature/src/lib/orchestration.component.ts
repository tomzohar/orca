import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'lib-orchestration-feature',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="orchestration-container">
      <h1>Orchestration</h1>
      <p>Orchestration feature works!</p>
    </div>
  `,
    styles: [`
    .orchestration-container {
      padding: 24px;
    }
  `]
})
export class OrchestrationComponent { }
