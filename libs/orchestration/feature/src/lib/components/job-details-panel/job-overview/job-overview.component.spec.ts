import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobOverviewComponent } from './job-overview.component';
import { provideMarkdown } from 'ngx-markdown';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import * as orchestrationData from '@orca/orchestration-data';

// Mock the TanStack Query hooks
jest.mock('@orca/orchestration-data', () => {
    const actual = jest.requireActual('@orca/orchestration-data');
    return {
        ...actual,
        injectCommentsQuery: jest.fn(),
        injectAddCommentMutation: jest.fn(),
    };
});

describe('JobOverviewComponent', () => {
    let component: JobOverviewComponent;
    let fixture: ComponentFixture<JobOverviewComponent>;

    beforeEach(async () => {
        // Mock the query and mutation hooks
        (orchestrationData.injectCommentsQuery as jest.Mock).mockReturnValue({
            data: signal([]),
            isLoading: signal(false),
            error: signal(null),
        });

        (orchestrationData.injectAddCommentMutation as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isPending: signal(false),
            error: signal(null),
        });

        await TestBed.configureTestingModule({
            imports: [JobOverviewComponent, HttpClientTestingModule],
            providers: [
                provideMarkdown(),
                provideAngularQuery(new QueryClient()),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JobOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
