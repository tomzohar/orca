import { TestBed } from '@angular/core/testing';
import { App } from './app';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideTanStackQuery(new QueryClient())],
    }).compileComponents();
  });

  it('should render router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
