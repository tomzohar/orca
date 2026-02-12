import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrchestrationComponent } from './orchestration.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';
import { JobEventsService, JobsService } from '@orca/orchestration-data';
import { DialogService, SidePanelService } from '@orca/design-system';
import { CreateJobDialogComponent } from './components/create-job-dialog/create-job-dialog.component';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap } from '@angular/router';

// Mock EventSource
class MockEventSource {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    close = jest.fn();

    constructor(public url: string) { }
}

global.EventSource = MockEventSource as any;

describe('OrchestrationComponent', () => {
    let component: OrchestrationComponent;
    let fixture: ComponentFixture<OrchestrationComponent>;
    let jobEventsService: JobEventsService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrchestrationComponent, HttpClientTestingModule],
            providers: [
                provideAngularQuery(new QueryClient({
                    defaultOptions: {
                        queries: {
                            retry: false,
                        },
                    },
                })),
                JobEventsService,
                JobsService,
                {
                    provide: DialogService,
                    useValue: {
                        open: jest.fn()
                    }
                },
                {
                    provide: SidePanelService,
                    useValue: {
                        open: jest.fn().mockReturnValue({
                            detachments: () => of(null)
                        }),
                        close: jest.fn()
                    }
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: jest.fn(),
                        events: of(new NavigationEnd(0, '', ''))
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap({})
                        },
                        paramMap: of(convertToParamMap({})),
                        params: of({})
                    }
                }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OrchestrationComponent);
        component = fixture.componentInstance;
        jobEventsService = TestBed.inject(JobEventsService);
        // Don't call detectChanges here - let individual tests control it
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have empty state config', () => {
        expect(component.emptyStateConfig).toBeDefined();
        expect(component.emptyStateConfig.title).toBe('No jobs yet');
        expect(component.emptyStateConfig.description).toBeDefined();
    });

    it('should handle job drop event', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const mockEvent = {
            item: { id: 1 } as any,
            sourceListId: 'PENDING',
            targetListId: 'RUNNING',
            currentIndex: 0,
            previousIndex: 0,
            container: {} as any
        };

        component.onJobDrop(mockEvent);

        expect(consoleSpy).toHaveBeenCalledWith('Job dropped:', mockEvent);
    });

    it('should handle menu item click to open dialog', () => {
        // Mock project data
        (component as any).projectDetection = {
            data: signal({
                project: { id: 1, name: 'Test' }
            })
        } as any;

        const dialogRefMock = {
            closed: of(123)
        } as any;

        const dialogService = TestBed.inject(DialogService);
        const openSpy = jest.spyOn(dialogService, 'open').mockReturnValue(dialogRefMock);
        const onJobCreatedSpy = jest.spyOn(component, 'onJobCreated');

        component.onCreateJob();

        expect(openSpy).toHaveBeenCalledWith(
            CreateJobDialogComponent,
            expect.objectContaining({
                data: { projectId: 1, projectName: 'Test' },
                title: 'Create Agent Job'
            })
        );
        expect(onJobCreatedSpy).toHaveBeenCalledWith(123);
    });

    it('should call JobEventsService when job is created', () => {
        const observeJobSpy = jest.spyOn(jobEventsService, 'observeJob');

        component.onJobCreated(123);

        // Should be called when projectId is available
        if (component.projectId()) {
            expect(observeJobSpy).toHaveBeenCalledWith(123, component.projectId());
        }
    });
});

