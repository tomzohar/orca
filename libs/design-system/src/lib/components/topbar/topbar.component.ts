import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { TopbarConfig, TopbarAction } from './topbar.types';

@Component({
  selector: 'orca-topbar',
  standalone: true,
  imports: [MatToolbarModule, ButtonComponent, InputComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  config = input.required<TopbarConfig>();
  actionClick = output<TopbarAction>();

  onActionClick(action: TopbarAction) {
    this.actionClick.emit(action);
  }
}
