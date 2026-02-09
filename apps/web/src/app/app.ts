import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AngularQueryDevtoolsComponent } from './utils/angular-query-devtools.component';
import { LayoutComponent } from '@orca/core/layout';

@Component({
  imports: [RouterModule, AngularQueryDevtoolsComponent, LayoutComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'web';
}
