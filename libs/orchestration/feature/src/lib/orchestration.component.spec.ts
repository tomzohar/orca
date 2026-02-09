import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrchestrationComponent } from './orchestration.component';

describe('OrchestrationComponent', () => {
    let component: OrchestrationComponent;
    let fixture: ComponentFixture<OrchestrationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrchestrationComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OrchestrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h1')?.textContent).toContain('Orchestration');
    });
});
