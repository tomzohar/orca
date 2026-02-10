import { Component, input, model, output, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { InputComponent } from './input.component';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'orca-tag-input',
    standalone: true,
    imports: [
        MatChipsModule,
        IconComponent,
        FormsModule,
        InputComponent
    ],
    template: `
        <div class="orca-tag-input">
            <orca-input
                class="tag-input-field"
                [config]="{ label: label(), placeholder: placeholder(), disabled: disabled() }"
                [(value)]="inputValue"
                (keydown.enter)="addTag()"
            />

            @if (tags().length > 0) {
                <mat-chip-set class="tag-chips" aria-label="Tags">
                    @for (tag of tags(); track tag) {
                        <mat-chip>
                            {{ tag }}
                            <button matChipRemove (click)="removeTag(tag)" [disabled]="disabled()">
                                <orca-icon [config]="{ name: 'cancel' }" />
                            </button>
                        </mat-chip>
                    }
                </mat-chip-set>
            }
        </div>
    `,
    styleUrl: './tag-input.component.scss'
})
export class TagInputComponent {
    // Inputs
    label = input<string>('');
    placeholder = input<string>('Add item and press Enter');
    disabled = input<boolean>(false);

    // Model binding for tags array
    tags = model<string[]>([]);

    // Output for changes
    tagsChange = output<string[]>();

    // Local state for input value
    inputValue = signal<string>('');

    /**
     * Adds a new tag to the list
     * Validates that tag is not empty and not duplicate
     */
    addTag(): void {
        const trimmedValue = this.inputValue().trim();

        // Don't add empty tags
        if (!trimmedValue) {
            return;
        }

        // Don't add duplicates
        if (this.tags().includes(trimmedValue)) {
            this.inputValue.set('');
            return;
        }

        // Add the tag
        const updatedTags = [...this.tags(), trimmedValue];
        this.tags.set(updatedTags);
        this.tagsChange.emit(updatedTags);

        // Clear input
        this.inputValue.set('');
    }

    /**
     * Removes a tag from the list
     * @param tag - The tag to remove
     */
    removeTag(tag: string): void {
        const updatedTags = this.tags().filter(t => t !== tag);
        this.tags.set(updatedTags);
        this.tagsChange.emit(updatedTags);
    }
}
