import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrchestrationKanbanComponent } from './orchestration-kanban.component';
import { JobStatus, AgentType, JobUIModel } from '@orca/orchestration-types';

describe('OrchestrationKanbanComponent', () => {
  let component: OrchestrationKanbanComponent;
  let fixture: ComponentFixture<OrchestrationKanbanComponent>;

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
    {
      id: '3',
      type: AgentType.FILE_SYSTEM,
      prompt: 'Test job 3',
      status: JobStatus.COMPLETED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      artifacts: [],
      formattedCreatedAt: 'Jan 3, 2024',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrchestrationKanbanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrchestrationKanbanComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should organize jobs by status', () => {
    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    const kanbanLists = component.kanbanLists();

    expect(kanbanLists.length).toBe(5);
    expect(kanbanLists[0].id).toBe(JobStatus.PENDING);
    expect(kanbanLists[0].items.length).toBe(1);
    expect(kanbanLists[1].id).toBe(JobStatus.RUNNING);
    expect(kanbanLists[1].items.length).toBe(1);
    expect(kanbanLists[3].id).toBe(JobStatus.COMPLETED);
    expect(kanbanLists[3].items.length).toBe(1);
  });

  it('should emit jobClicked when job is clicked', () => {
    let clickedJob: JobUIModel | undefined;
    component.jobClicked.subscribe((job) => {
      clickedJob = job;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    component.onJobClick(mockJobs[0]);
    expect(clickedJob).toEqual(mockJobs[0]);
  });

  it('should emit jobClicked on Enter key', () => {
    let clickedJob: JobUIModel | undefined;
    component.jobClicked.subscribe((job) => {
      clickedJob = job;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onJobKeyDown(event, mockJobs[0]);
    expect(clickedJob).toEqual(mockJobs[0]);
  });

  it('should emit jobClicked on Space key', () => {
    let clickedJob: JobUIModel | undefined;
    component.jobClicked.subscribe((job) => {
      clickedJob = job;
    });

    fixture.componentRef.setInput('jobs', mockJobs);
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: ' ' });
    component.onJobKeyDown(event, mockJobs[0]);
    expect(clickedJob).toEqual(mockJobs[0]);
  });

  it('should handle empty jobs array', () => {
    fixture.componentRef.setInput('jobs', []);
    fixture.detectChanges();

    const kanbanLists = component.kanbanLists();
    kanbanLists.forEach(list => {
      expect(list.items.length).toBe(0);
    });
  });
});
