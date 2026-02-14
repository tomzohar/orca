import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMarkdown } from 'ngx-markdown';
import { JobCommentsComponent } from './job-comments.component';
import { JobComment, UserType } from '@orca/orchestration-types';
import { IconName } from '@orca/design-system';

describe('JobCommentsComponent', () => {
  let component: JobCommentsComponent;
  let fixture: ComponentFixture<JobCommentsComponent>;

  const mockComments: JobComment[] = [
    {
      id: 1,
      jobId: 1,
      authorId: 1,
      author: {
        id: 1,
        name: 'John Doe',
        type: UserType.HUMAN,
      },
      content: 'This is a test comment',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      jobId: 1,
      authorId: 2,
      author: {
        id: 2,
        name: 'Coding Agent',
        type: UserType.AGENT,
      },
      content: 'This is an agent comment',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCommentsComponent, HttpClientTestingModule],
      providers: [provideMarkdown()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCommentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading State', () => {
    it('should display spinner when loading is true', () => {
      fixture.componentRef.setInput('comments', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('orca-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should not display comments when loading', () => {
      fixture.componentRef.setInput('comments', mockComments);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const commentsList = fixture.nativeElement.querySelector('.comments-list');
      expect(commentsList).toBeFalsy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no comments', () => {
      fixture.componentRef.setInput('comments', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('orca-empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should not display comments list when empty', () => {
      fixture.componentRef.setInput('comments', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const commentsList = fixture.nativeElement.querySelector('.comments-list');
      expect(commentsList).toBeFalsy();
    });
  });

  describe('Comments Display', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('comments', mockComments);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
    });

    it('should display all comments', () => {
      const comments = fixture.nativeElement.querySelectorAll('.comment');
      expect(comments.length).toBe(mockComments.length);
    });

    it('should display avatar for each comment', () => {
      const avatars = fixture.nativeElement.querySelectorAll('orca-avatar');
      expect(avatars.length).toBe(mockComments.length);
    });

    it('should display author names', () => {
      const authorElements = fixture.nativeElement.querySelectorAll('.comment-author');
      expect(authorElements[0].textContent.trim()).toBe('John Doe');
      expect(authorElements[1].textContent.trim()).toBe('Coding Agent');
    });

    it('should display comment dates', () => {
      const dateElements = fixture.nativeElement.querySelectorAll('.comment-date');
      expect(dateElements.length).toBe(mockComments.length);
    });

    it('should display comment content', () => {
      const contentElements = fixture.nativeElement.querySelectorAll('.comment-content');
      expect(contentElements.length).toBe(mockComments.length);
    });
  });

  describe('Avatar Configuration', () => {
    it('should use person icon for HUMAN users', () => {
      const humanComment: JobComment = {
        id: 1,
        jobId: 1,
        authorId: 1,
        author: {
          id: 1,
          name: 'John Doe',
          type: UserType.HUMAN,
        },
        content: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const config = component.getAvatarConfig(humanComment);
      expect(config.icon).toBe(IconName.person);
    });

    it('should use smart_toy icon for AGENT users', () => {
      const agentComment: JobComment = {
        id: 2,
        jobId: 1,
        authorId: 2,
        author: {
          id: 2,
          name: 'Coding Agent',
          type: UserType.AGENT,
        },
        content: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const config = component.getAvatarConfig(agentComment);
      expect(config.icon).toBe(IconName.smart_toy);
    });

    it('should set avatar size to small', () => {
      const config = component.getAvatarConfig(mockComments[0]);
      expect(config.size).toBe('sm');
    });

    it('should set avatar shape to circular', () => {
      const config = component.getAvatarConfig(mockComments[0]);
      expect(config.shape).toBe('circular');
    });

    it('should enable icon display', () => {
      const config = component.getAvatarConfig(mockComments[0]);
      expect(config.showIcon).toBe(true);
    });
  });

  describe('Author Name Display', () => {
    it('should return author name when available', () => {
      const name = component.getAuthorName(mockComments[0]);
      expect(name).toBe('John Doe');
    });

    it('should return "Unknown User" when author is missing', () => {
      const commentWithoutAuthor: JobComment = {
        id: 3,
        jobId: 1,
        authorId: 3,
        content: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const name = component.getAuthorName(commentWithoutAuthor);
      expect(name).toBe('Unknown User');
    });

    it('should return "Unknown User" when author name is missing', () => {
      const commentWithPartialAuthor: JobComment = {
        id: 4,
        jobId: 1,
        authorId: 4,
        author: {
          id: 4,
          name: '',
          type: UserType.HUMAN,
        },
        content: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const name = component.getAuthorName(commentWithPartialAuthor);
      expect(name).toBe('Unknown User');
    });
  });

  describe('Markdown Configuration', () => {
    it('should have preview-only markdown config', () => {
      expect(component.markdownConfig.mode).toBe('preview');
      expect(component.markdownConfig.toolbar?.enabled).toBe(false);
      expect(component.markdownConfig.showModeToggle).toBe(false);
      expect(component.markdownConfig.height).toBe('auto');
    });
  });
});
