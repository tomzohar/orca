import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent, NoopAnimationsModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render trigger button', () => {
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger).toBeTruthy();
  });

  it('should emit menuOpened event', () => {
    const spy = vi.spyOn(component.menuOpened, 'emit');
    component.onMenuOpened();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit menuClosed event', () => {
    const spy = vi.spyOn(component.menuClosed, 'emit');
    component.onMenuClosed();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle item action', () => {
    const actionSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = { label: 'Test Item', action: actionSpy };
    component.handleAction(item);
    expect(actionSpy).toHaveBeenCalledWith(item);
  });
});
