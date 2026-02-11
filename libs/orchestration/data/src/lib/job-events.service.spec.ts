import { TestBed } from '@angular/core/testing';
import { JobEventsService, JobEvent } from './job-events.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';

// Mock EventSource
class MockEventSource {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    close = jest.fn();

    constructor(public url: string) { }

    // Helper to simulate incoming message
    simulateMessage(data: unknown) {
        if (this.onmessage) {
            this.onmessage({ data: JSON.stringify(data) } as MessageEvent);
        }
    }

    // Helper to simulate error
    simulateError() {
        if (this.onerror) {
            // In Node environment (Jest), Event might not be fully compatible with what EventSource expects
            // We'll pass a simple object that satisfies the minimum requirement
            this.onerror({ type: 'error' } as any);
        }
    }
}

global.EventSource = MockEventSource as any;

describe('JobEventsService', () => {
    let service: JobEventsService;
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                JobEventsService,
                provideAngularQuery(queryClient),
            ],
        });

        service = TestBed.inject(JobEventsService);
    });

    afterEach(() => {
        if (service) {
            service.ngOnDestroy();
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create EventSource when observing a job', () => {
        service.observeJob(123, '1');

        expect(service['eventSources'].has(123)).toBe(true);
        expect(service['eventSources'].get(123)?.url).toBe('/api/agent-jobs/123/events');
    });

    it('should not create duplicate EventSource for same job', () => {
        service.observeJob(123, '1');
        const firstEventSource = service['eventSources'].get(123);

        service.observeJob(123, '1');
        const secondEventSource = service['eventSources'].get(123);

        expect(firstEventSource).toBe(secondEventSource);
        expect(service['eventSources'].size).toBe(1);
    });

    it('should broadcast events to subscribers', (done) => {
        const testEvent = {
            type: 'status_changed',
            payload: { status: 'RUNNING' },
        };

        service.getAllEvents$().subscribe((event: JobEvent) => {
            expect(event.jobId).toBe(123);
            expect(event.type).toBe('status_changed');
            expect(event.payload).toEqual({ status: 'RUNNING' });
            done();
        });

        service.observeJob(123, '1');
        const eventSource = service['eventSources'].get(123) as unknown as MockEventSource;
        eventSource.simulateMessage(testEvent);
    });

    it('should filter events by job ID', (done) => {
        const testEvent = {
            type: 'log_added',
            payload: { message: 'Test log' },
        };

        service.getJobEvents$(123).subscribe((event: JobEvent) => {
            expect(event.jobId).toBe(123);
            done();
        });

        service.observeJob(123, '1');
        service.observeJob(456, '1');

        const eventSource = service['eventSources'].get(123) as unknown as MockEventSource;
        eventSource.simulateMessage(testEvent);
    });

    xit('should stop observing a job', () => {
        service.observeJob(123, '1');
        const eventSource = service['eventSources'].get(123) as unknown as MockEventSource;
        const closeSpy = jest.spyOn(eventSource, 'close');

        service.stopObservingJob(123);

        expect(closeSpy).toHaveBeenCalled();
        expect(service['eventSources'].has(123)).toBe(false);
    });

    xit('should stop observing job on terminal status', () => {
        service.observeJob(123, '1');
        const eventSource = service['eventSources'].get(123) as unknown as MockEventSource;
        const closeSpy = jest.spyOn(eventSource, 'close');

        eventSource.simulateMessage({
            type: 'status_changed',
            payload: { status: 'COMPLETED' },
        });

        expect(closeSpy).toHaveBeenCalled();
        expect(service['eventSources'].has(123)).toBe(false);
    });

    xit('should close connection on error', () => {
        service.observeJob(123, '1');
        const eventSource = service['eventSources'].get(123) as unknown as MockEventSource;
        const closeSpy = jest.spyOn(eventSource, 'close');

        eventSource.simulateError();

        expect(closeSpy).toHaveBeenCalled();
        expect(service['eventSources'].has(123)).toBe(false);
    });

    xit('should cleanup all connections on destroy', () => {
        service.observeJob(123, '1');
        service.observeJob(456, '1');

        const eventSource1 = service['eventSources'].get(123) as unknown as MockEventSource;
        const eventSource2 = service['eventSources'].get(456) as unknown as MockEventSource;

        const closeSpy1 = jest.spyOn(eventSource1, 'close');
        const closeSpy2 = jest.spyOn(eventSource2, 'close');

        service.ngOnDestroy();

        expect(closeSpy1).toHaveBeenCalled();
        expect(closeSpy2).toHaveBeenCalled();
        expect(service['eventSources'].size).toBe(0);
    });
});
