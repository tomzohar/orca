import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobArtifactsComponent } from './job-artifacts.component';

describe('JobArtifactsComponent', () => {
    let component: JobArtifactsComponent;
    let fixture: ComponentFixture<JobArtifactsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JobArtifactsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JobArtifactsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
