import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateJobDialogComponent, CreateJobDialogData } from './create-job-dialog.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';
import * as orchestrationData from '@orca/orchestration-data';

// Mock the injectCreateJobMutation function
jest.mock('@orca/orchestration-data', () => {
    const actual = jest.requireActual('@orca/orchestration-data');
    return {
        ...actual,
        injectCreateJobMutation: jest.fn(),
    };
});

describe('CreateJobDialogComponent', () => {
    let component: CreateJobDialogComponent;
    let fixture: ComponentFixture<CreateJobDialogComponent>;
    let dialogRefSpy: jest.Mocked<DialogRef<number>>;
    let mutationMock: any;

    const mockData: CreateJobDialogData = {
        projectId: 1,
        projectName: 'Test Project',
    };

    beforeEach(async () => {
        dialogRefSpy = {
            close: jest.fn(),
        } as any;

        mutationMock = {
            mutate: jest.fn(),
            isPending: signal(false),
            error: signal(null),
        };

        (orchestrationData.injectCreateJobMutation as jest.Mock).mockReturnValue(mutationMock);

        await TestBed.configureTestingModule({
            imports: [CreateJobDialogComponent, HttpClientTestingModule],
            providers: [
                { provide: DialogRef, useValue: dialogRefSpy },
                { provide: DIALOG_DATA, useValue: mockData },
                provideAngularQuery(new QueryClient()),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateJobDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with project data', () => {
        expect(component.projectId).toBe(mockData.projectId);
        expect(component.projectName).toBe(mockData.projectName);
    });

    it('should not allow submission when prompt is empty', () => {
        component.prompt.set('');
        expect(component.canSubmit()).toBe(false);

        component.prompt.set('   ');
        expect(component.canSubmit()).toBe(false);
    });

    it('should allow submission when prompt is provided', () => {
        component.prompt.set('Test prompt');
        expect(component.canSubmit()).toBe(true);
    });

    it('should close dialog when onCancel is called', () => {
        component.onCancel();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should close dialog when onClose is called and not submitting', () => {
        mutationMock.isPending.set(false);
        component.onClose();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call mutate and close dialog on success', () => {
        component.prompt.set('Test prompt');
        component.agentType.set('CLAUDE_SDK');

        component.onSubmit();

        expect(mutationMock.mutate).toHaveBeenCalledWith(
            {
                prompt: 'Test prompt',
                type: 'CLAUDE_SDK',
                projectId: mockData.projectId,
            },
            expect.any(Object)
        );

        // Simulate success
        const onSuccess = mutationMock.mutate.mock.calls[0][1].onSuccess;
        onSuccess({ id: 123 });

        expect(dialogRefSpy.close).toHaveBeenCalledWith(123);
    });
});
