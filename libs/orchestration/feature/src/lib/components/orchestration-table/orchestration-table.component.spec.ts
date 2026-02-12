import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrchestrationTableComponent } from './orchestration-table.component';
import { JobStatus, AgentType, JobUIModel } from '@orca/orchestration-types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('OrchestrationTableComponent', () => {
  let component: OrchestrationTableComponent;
  let fixture: ComponentFixture<OrchestrationTableComponent>;

  const mockJobs: JobUIModel[] = [
    {
      id: '1',
      type: AgentType.FILE_SYSTEM,
      prompt: 'Test job 1',
      status: JobStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      artifacts: [],
      formattedCreatedAt: 'Jan 1, 2024',
    },
    {
      id: '2',
      type: AgentType.DOCKER,
      prompt: 'Test job 2',
      status: JobStatus.RUNNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      artifacts: [],
      formattedCreatedAt: 'Jan 2, 2024',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrchestrationTableComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OrchestrationTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display jobs in table', () => {
    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    const tableConfig = component.tableConfig();
    expect(tableConfig.data).toEqual(mockJobs);
    expect(tableConfig.columns.length).toBeGreaterThan(0);
  });

  it('should emit jobClicked when row is clicked', () => {
    let clickedJob: JobUIModel | undefined;
    component.jobClicked.subscribe((job) => {
      clickedJob = job;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    component.onJobClick(mockJobs[0]);
    expect(clickedJob).toEqual(mockJobs[0]);
  });

  it('should emit jobAction when cancel is clicked', () => {
    let actionEvent: { job: JobUIModel; action: string } | undefined;
    component.jobAction.subscribe((event) => {
      actionEvent = event;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    component.onCancelJob(mockJobs[0]);
    expect(actionEvent?.job).toEqual(mockJobs[0]);
    expect(actionEvent?.action).toBe('cancel');
  });

  it('should emit jobAction when retry is clicked', () => {
    let actionEvent: { job: JobUIModel; action: string } | undefined;
    component.jobAction.subscribe((event) => {
      actionEvent = event;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    component.onRetryJob(mockJobs[0]);
    expect(actionEvent?.job).toEqual(mockJobs[0]);
    expect(actionEvent?.action).toBe('retry');
  });

  it('should emit jobAction when delete is clicked', () => {
    let actionEvent: { job: JobUIModel; action: string } | undefined;
    component.jobAction.subscribe((event) => {
      actionEvent = event;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    component.onDeleteJob(mockJobs[0]);
    expect(actionEvent?.job).toEqual(mockJobs[0]);
    expect(actionEvent?.action).toBe('delete');
  });

  it('should show loading state', () => {
    fixture.componentRef.setInput('jobs', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const tableConfig = component.tableConfig();
    expect(tableConfig.loading).toBe(true);
  });

  it('should show error state', () => {
    fixture.componentRef.setInput('jobs', []);
    fixture.componentRef.setInput('error', 'Test error');
    fixture.detectChanges();

    const tableConfig = component.tableConfig();
    expect(tableConfig.error).toBe('Test error');
  });
});
