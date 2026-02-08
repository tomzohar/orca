import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AngularQueryDevtoolsComponent } from './utils/angular-query-devtools.component';

@Component({
  imports: [RouterModule, AngularQueryDevtoolsComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'web';
}
