import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagInputComponent } from './tag-input.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TagInputComponent', () => {
    let component: TagInputComponent;
    let fixture: ComponentFixture<TagInputComponent>;
    let compiled: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TagInputComponent, NoopAnimationsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(TagInputComponent);
        component = fixture.componentInstance;
        compiled = fixture.nativeElement as HTMLElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Tag Management', () => {
        it('should initialize with empty tags by default', () => {
            expect(component.tags()).toEqual([]);
        });

        it('should initialize with provided tags', () => {
            const initialTags = ['node_modules', '.git'];
            fixture.componentRef.setInput('tags', initialTags);
            fixture.detectChanges();

            expect(component.tags()).toEqual(initialTags);
        });

        it('should add a tag when addTag is called with valid input', () => {
            component.inputValue.set('test-tag');
            component.addTag();

            expect(component.tags()).toContain('test-tag');
            expect(component.inputValue()).toBe('');
        });

        it('should not add empty tags', () => {
            component.inputValue.set('   ');
            component.addTag();

            expect(component.tags()).toEqual([]);
        });

        it('should not add duplicate tags', () => {
            component.tags.set(['existing-tag']);
            component.inputValue.set('existing-tag');
            component.addTag();

            expect(component.tags()).toEqual(['existing-tag']);
        });

        it('should remove a tag when removeTag is called', () => {
            component.tags.set(['tag1', 'tag2', 'tag3']);
            component.removeTag('tag2');

            expect(component.tags()).toEqual(['tag1', 'tag3']);
        });

        it('should trim whitespace from tags', () => {
            component.inputValue.set('  spaced-tag  ');
            component.addTag();

            expect(component.tags()).toContain('spaced-tag');
        });
    });

    describe('Keyboard Interactions', () => {
        it('should add tag on Enter key press', () => {
            const input = compiled.querySelector('input') as HTMLInputElement;
            component.inputValue.set('keyboard-tag');
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            input.dispatchEvent(event);
            fixture.detectChanges();

            expect(component.tags()).toContain('keyboard-tag');
        });

        it('should not add tag on other key presses', () => {
            const input = compiled.querySelector('input') as HTMLInputElement;
            component.inputValue.set('test-tag');
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', { key: 'a' });
            input.dispatchEvent(event);
            fixture.detectChanges();

            expect(component.tags()).toEqual([]);
        });
    });

    describe('UI Rendering', () => {
        it('should render input field with placeholder', () => {
            fixture.componentRef.setInput('placeholder', 'Add exclude pattern');
            fixture.detectChanges();

            const input = compiled.querySelector('input');
            expect(input).toBeTruthy();
            expect(input?.getAttribute('placeholder')).toBe('Add exclude pattern');
        });

        it('should render chips for each tag', () => {
            component.tags.set(['tag1', 'tag2', 'tag3']);
            fixture.detectChanges();

            const chips = compiled.querySelectorAll('mat-chip');
            expect(chips.length).toBe(3);
        });

        it('should render remove button for each chip', () => {
            component.tags.set(['tag1', 'tag2']);
            fixture.detectChanges();

            const removeButtons = compiled.querySelectorAll('mat-chip button');
            expect(removeButtons.length).toBe(2);
        });

        it('should remove tag when chip remove button is clicked', () => {
            component.tags.set(['removable-tag', 'other-tag']);
            fixture.detectChanges();

            const removeButton = compiled.querySelector('mat-chip button') as HTMLButtonElement;
            removeButton.click();
            fixture.detectChanges();

            expect(component.tags()).toEqual(['other-tag']);
        });
    });

    describe('Model Binding', () => {
        it('should update tags when addTag is called', () => {
            component.inputValue.set('new-tag');
            component.addTag();

            expect(component.tags()).toEqual(['new-tag']);
        });

        it('should update tags when removeTag is called', () => {
            component.tags.set(['tag1', 'tag2']);
            component.removeTag('tag1');

            expect(component.tags()).toEqual(['tag2']);
        });
    });

    describe('Configuration', () => {
        it('should disable input when disabled is true', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();

            const input = compiled.querySelector('input') as HTMLInputElement;
            expect(input.disabled).toBe(true);
        });

        it('should enable input when disabled is false', () => {
            fixture.componentRef.setInput('disabled', false);
            fixture.detectChanges();

            const input = compiled.querySelector('input') as HTMLInputElement;
            expect(input.disabled).toBe(false);
        });
    });
});
