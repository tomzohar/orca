import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { vi } from 'vitest';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        {
          provide: DIALOG_DATA,
          useValue: {
            message: 'Are you sure you want to delete this item?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            danger: true,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const messageElement = fixture.nativeElement.querySelector('.confirmation-message');
    expect(messageElement.textContent.trim()).toBe('Are you sure you want to delete this item?');
  });

  it('should close with false when cancel action is clicked', () => {
    component.onActionClick('cancel');
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close with true when confirm action is clicked', () => {
    component.onActionClick('confirm');
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when dialog is closed via close button', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should use default values when not provided', () => {
    TestBed.resetTestingModule();
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        {
          provide: DIALOG_DATA,
          useValue: { message: 'Test message' },
        },
      ],
    });

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.config.title).toBe('Confirm');
    expect(component.config.confirmText).toBe('Confirm');
    expect(component.config.cancelText).toBe('Cancel');
    expect(component.config.danger).toBe(false);
  });
});
