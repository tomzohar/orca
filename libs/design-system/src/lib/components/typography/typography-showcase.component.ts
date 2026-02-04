import { Component } from '@angular/core';

@Component({
  selector: 'orca-typography-showcase',
  standalone: true,
  template: `
    <div style="padding: 24px; color: white;">
      <section style="margin-bottom: 48px;">
        <h2 style="border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 24px;">Headings</h2>
        <div style="display: flex; flex-direction: column; gap: 32px;">
          <div>
            <span style="color: #64748b; font-size: 12px;">H1 - 96px Bold</span>
            <h1>Heading 1</h1>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">H2 - 60px Bold</span>
            <h2>Heading 2</h2>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">H3 - 48px SemiBold</span>
            <h3>Heading 3</h3>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">H4 - 34px SemiBold</span>
            <h4>Heading 4</h4>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">H5 - 24px SemiBold</span>
            <h5>Heading 5</h5>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">H6 - 20px SemiBold Uppercase</span>
            <h6>Heading 6</h6>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 48px;">
        <h2 style="border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 24px;">Body & UI</h2>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div>
            <span style="color: #64748b; font-size: 12px;">Body 1 - 16px Regular</span>
            <p>Body 1: The autonomous software orchestrator manages complex agent interactions efficiently.</p>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;">Body 2 - 14px Regular</span>
            <p class="text-body-2">Body 2: Secondary text for descriptions and metadata.</p>
          </div>
          <div>
            <span style="color: #64748b; font-size: 12px;display: block">Button - 14px SemiBold</span>
            <div style="padding: 8px; background: #2979ff; display: inline-block; border-radius: 4px; font-weight: 600; font-size: 14px;">
              BUTTON TEXT
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class TypographyShowcaseComponent { }
