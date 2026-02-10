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

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
