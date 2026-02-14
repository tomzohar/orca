import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { AvatarConfig } from '../../../types/component.types';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Default Configuration', () => {
    it('should apply default config', () => {
      fixture.componentRef.setInput('config', {});
      fixture.detectChanges();

      const config = component.config();
      expect(config.size).toBe('md');
      expect(config.shape).toBe('circular');
      expect(config.showIcon).toBe(true);
      expect(config.showStatus).toBe(false);
    });
  });

  describe('Size Variants', () => {
    const sizeTestCases: Array<{ size: AvatarConfig['size']; expectedClass: string }> = [
      { size: 'sm', expectedClass: 'avatar-sm' },
      { size: 'md', expectedClass: 'avatar-md' },
      { size: 'lg', expectedClass: 'avatar-lg' },
      { size: 'xl', expectedClass: 'avatar-xl' },
    ];

    sizeTestCases.forEach(({ size, expectedClass }) => {
      it(`should apply ${expectedClass} class for size ${size}`, () => {
        fixture.componentRef.setInput('config', { size });
        fixture.detectChanges();

        const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
        expect(avatarElement.classList.contains(expectedClass)).toBe(true);
      });
    });
  });

  describe('Shape Variants', () => {
    it('should apply circular shape class', () => {
      fixture.componentRef.setInput('config', { shape: 'circular' });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      expect(avatarElement.classList.contains('avatar-circular')).toBe(true);
    });

    it('should apply square shape class', () => {
      fixture.componentRef.setInput('config', { shape: 'square' });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      expect(avatarElement.classList.contains('avatar-square')).toBe(true);
    });
  });

  describe('Display Modes', () => {
    describe('Image Display', () => {
      it('should display image when src is provided', () => {
        fixture.componentRef.setInput('config', {
          src: 'test-image.jpg',
          alt: 'Test Alt'
        });
        fixture.detectChanges();

        const imageElement = fixture.nativeElement.querySelector('.avatar-image');
        expect(imageElement).toBeTruthy();
        expect(imageElement.src).toContain('test-image.jpg');
        expect(imageElement.alt).toBe('Test Alt');
      });

      it('should use default alt text when alt is not provided', () => {
        fixture.componentRef.setInput('config', { src: 'test-image.jpg' });
        fixture.detectChanges();

        const imageElement = fixture.nativeElement.querySelector('.avatar-image');
        expect(imageElement.alt).toBe('Avatar');
      });

      it('should hide image on error', () => {
        fixture.componentRef.setInput('config', { src: 'invalid-image.jpg' });
        fixture.detectChanges();

        const imageElement = fixture.nativeElement.querySelector('.avatar-image');

        // Simulate image error with proper target
        const errorEvent = { target: imageElement } as Event;
        component.onImageError(errorEvent);

        expect(imageElement.style.display).toBe('none');
      });
    });

    describe('Initials Display', () => {
      it('should display provided initials', () => {
        fixture.componentRef.setInput('config', { initials: 'JD' });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement).toBeTruthy();
        expect(initialsElement.textContent.trim()).toBe('JD');
      });

      it('should truncate initials to 2 characters and uppercase', () => {
        fixture.componentRef.setInput('config', { initials: 'john' });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement.textContent.trim()).toBe('JO');
      });

      it('should generate initials from name', () => {
        fixture.componentRef.setInput('config', { name: 'John Doe' });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement.textContent.trim()).toBe('JD');
      });

      it('should handle single name for initials', () => {
        fixture.componentRef.setInput('config', { name: 'John' });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement.textContent.trim()).toBe('J');
      });

      it('should handle multiple names and take first two', () => {
        fixture.componentRef.setInput('config', { name: 'John Michael Doe Smith' });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement.textContent.trim()).toBe('JM');
      });

      it('should prefer initials over name when both provided', () => {
        fixture.componentRef.setInput('config', {
          initials: 'AB',
          name: 'John Doe'
        });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        expect(initialsElement.textContent.trim()).toBe('AB');
      });
    });

    describe('Icon Display', () => {
      it('should display icon when no image or initials provided and showIcon is true', () => {
        fixture.componentRef.setInput('config', { showIcon: true });
        fixture.detectChanges();

        const iconElement = fixture.nativeElement.querySelector('.avatar-icon');
        expect(iconElement).toBeTruthy();
      });

      it('should not display icon when showIcon is false', () => {
        fixture.componentRef.setInput('config', { showIcon: false });
        fixture.detectChanges();

        const iconElement = fixture.nativeElement.querySelector('.avatar-icon');
        expect(iconElement).toBeFalsy();
      });

      it('should not display icon when image is provided', () => {
        fixture.componentRef.setInput('config', {
          src: 'test-image.jpg',
          showIcon: true
        });
        fixture.detectChanges();

        const iconElement = fixture.nativeElement.querySelector('.avatar-icon');
        expect(iconElement).toBeFalsy();
      });

      it('should not display icon when initials are provided', () => {
        fixture.componentRef.setInput('config', {
          initials: 'JD',
          showIcon: true
        });
        fixture.detectChanges();

        const iconElement = fixture.nativeElement.querySelector('.avatar-icon');
        expect(iconElement).toBeFalsy();
      });

      it('should use default person icon when no custom icon provided', () => {
        fixture.componentRef.setInput('config', { showIcon: true });
        fixture.detectChanges();

        expect(component.avatarIcon()).toBe('person');
      });

      it('should use custom icon when provided', () => {
        fixture.componentRef.setInput('config', {
          showIcon: true,
          icon: 'smart_toy'
        });
        fixture.detectChanges();

        expect(component.avatarIcon()).toBe('smart_toy');
      });
    });

    describe('Display Priority', () => {
      it('should prioritize image over initials', () => {
        fixture.componentRef.setInput('config', {
          src: 'test-image.jpg',
          initials: 'JD'
        });
        fixture.detectChanges();

        const imageElement = fixture.nativeElement.querySelector('.avatar-image');
        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');

        expect(imageElement).toBeTruthy();
        expect(initialsElement).toBeFalsy();
      });

      it('should prioritize initials over icon', () => {
        fixture.componentRef.setInput('config', {
          initials: 'JD',
          showIcon: true
        });
        fixture.detectChanges();

        const initialsElement = fixture.nativeElement.querySelector('.avatar-initials');
        const iconElement = fixture.nativeElement.querySelector('.avatar-icon');

        expect(initialsElement).toBeTruthy();
        expect(iconElement).toBeFalsy();
      });
    });
  });

  describe('Status Indicator', () => {
    it('should show status indicator when showStatus is true and status is provided', () => {
      fixture.componentRef.setInput('config', {
        showStatus: true,
        status: 'online'
      });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      const statusElement = fixture.nativeElement.querySelector('.status-indicator');

      expect(avatarElement.classList.contains('has-status')).toBe(true);
      expect(statusElement).toBeTruthy();
    });

    it('should not show status indicator when showStatus is false', () => {
      fixture.componentRef.setInput('config', {
        showStatus: false,
        status: 'online'
      });
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status-indicator');
      expect(statusElement).toBeFalsy();
    });

    it('should not show status indicator when status is not provided', () => {
      fixture.componentRef.setInput('config', { showStatus: true });
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status-indicator');
      expect(statusElement).toBeFalsy();
    });

    const statusTestCases: Array<{
      status: AvatarConfig['status'];
      expectedClass: string
    }> = [
      { status: 'online', expectedClass: 'status-online' },
      { status: 'offline', expectedClass: 'status-offline' },
      { status: 'away', expectedClass: 'status-away' },
      { status: 'busy', expectedClass: 'status-busy' },
    ];

    statusTestCases.forEach(({ status, expectedClass }) => {
      it(`should apply ${expectedClass} class for ${status} status`, () => {
        fixture.componentRef.setInput('config', {
          showStatus: true,
          status
        });
        fixture.detectChanges();

        const statusElement = fixture.nativeElement.querySelector('.status-indicator');
        expect(statusElement.classList.contains(expectedClass)).toBe(true);
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom background color', () => {
      fixture.componentRef.setInput('config', {
        backgroundColor: '#ff0000'
      });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      expect(avatarElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should apply custom text color', () => {
      fixture.componentRef.setInput('config', {
        textColor: '#ffffff'
      });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      expect(avatarElement.style.color).toBe('rgb(255, 255, 255)');
    });

    it('should apply both custom background and text colors', () => {
      fixture.componentRef.setInput('config', {
        backgroundColor: '#000000',
        textColor: '#ffffff'
      });
      fixture.detectChanges();

      const avatarElement = fixture.nativeElement.querySelector('.orca-avatar');
      expect(avatarElement.style.backgroundColor).toBe('rgb(0, 0, 0)');
      expect(avatarElement.style.color).toBe('rgb(255, 255, 255)');
    });
  });

  describe('Computed Properties', () => {
    it('should compute displayInitials correctly', () => {
      fixture.componentRef.setInput('config', { initials: 'test' });
      fixture.detectChanges();

      expect(component.displayInitials()).toBe('TE');
    });

    it('should compute showImage correctly', () => {
      fixture.componentRef.setInput('config', { src: 'test.jpg' });
      fixture.detectChanges();

      expect(component.showImage()).toBe(true);

      fixture.componentRef.setInput('config', {});
      fixture.detectChanges();

      expect(component.showImage()).toBe(false);
    });

    it('should compute showInitials correctly', () => {
      fixture.componentRef.setInput('config', { initials: 'JD' });
      fixture.detectChanges();

      expect(component.showInitials()).toBe(true);

      fixture.componentRef.setInput('config', { src: 'test.jpg', initials: 'JD' });
      fixture.detectChanges();

      expect(component.showInitials()).toBe(false);
    });

    it('should compute showIcon correctly', () => {
      fixture.componentRef.setInput('config', { showIcon: true });
      fixture.detectChanges();

      expect(component.showIcon()).toBe(true);

      fixture.componentRef.setInput('config', { initials: 'JD', showIcon: true });
      fixture.detectChanges();

      expect(component.showIcon()).toBe(false);
    });

    it('should compute iconSize correctly based on avatar size', () => {
      const sizeMap = {
        'sm': 'sm',
        'md': 'md',
        'lg': 'lg',
        'xl': 'xl'
      };

      Object.entries(sizeMap).forEach(([avatarSize, expectedIconSize]) => {
        fixture.componentRef.setInput('config', { size: avatarSize as AvatarConfig['size'] });
        fixture.detectChanges();

        expect(component.iconSize()).toBe(expectedIconSize);
      });
    });
  });

  describe('Content Projection', () => {
    it('should allow custom content projection', () => {
      const customContent = '<span class="custom-content">🎨</span>';
      fixture = TestBed.createComponent(AvatarComponent);
      fixture.nativeElement.innerHTML = `<orca-avatar>${customContent}</orca-avatar>`;
      fixture.componentRef.setInput('config', {});
      fixture.detectChanges();

      const projectedContent = fixture.nativeElement.querySelector('.custom-content');
      expect(projectedContent).toBeTruthy();
      expect(projectedContent.textContent).toBe('🎨');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty name gracefully', () => {
      fixture.componentRef.setInput('config', { name: '' });
      fixture.detectChanges();

      expect(component.displayInitials()).toBe('');
    });

    it('should handle name with only spaces', () => {
      fixture.componentRef.setInput('config', { name: '   ' });
      fixture.detectChanges();

      expect(component.displayInitials()).toBe('');
    });

    it('should handle undefined config gracefully', () => {
      fixture.componentRef.setInput('config', undefined);
      fixture.detectChanges();

      const config = component.config();
      expect(config.size).toBe('md');
      expect(config.shape).toBe('circular');
    });

    it('should handle partial config merge correctly', () => {
      fixture.componentRef.setInput('config', { size: 'lg' });
      fixture.detectChanges();

      const config = component.config();
      expect(config.size).toBe('lg');
      expect(config.shape).toBe('circular'); // Should use default
      expect(config.showIcon).toBe(true); // Should use default
    });
  });
});