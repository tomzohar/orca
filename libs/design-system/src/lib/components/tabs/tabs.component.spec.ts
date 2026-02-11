import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabsConfig } from '../../types/component.types';
import { MatTabChangeEvent } from '@angular/material/tabs';

describe('TabsComponent', () => {
    let component: TabsComponent;
    let fixture: ComponentFixture<TabsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TabsComponent, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(TabsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Configuration', () => {
        it('should initialize with default configuration when no config provided', () => {
            fixture.detectChanges();
            const config = component.config();

            expect(config.tabs).toEqual([]);
            expect(config.selectedIndex).toBe(0);
            expect(config.alignment).toBe('start');
            expect(config.disableRipple).toBe(false);
            expect(config.headerPosition).toBe('above');
            expect(config.animationDuration).toBe('300ms');
        });

        it('should merge partial config with defaults', () => {
            const partialConfig: Partial<TabsConfig> = {
                tabs: [
                    { label: 'Tab 1' },
                    { label: 'Tab 2' }
                ]
            };

            fixture.componentRef.setInput('config', partialConfig);
            fixture.detectChanges();

            const config = component.config();
            expect(config.tabs.length).toBe(2);
            expect(config.selectedIndex).toBe(0);
            expect(config.alignment).toBe('start');
        });
    });

    describe('Tab Selection', () => {
        beforeEach(() => {
            const config: TabsConfig = {
                tabs: [
                    { label: 'First' },
                    { label: 'Second' },
                    { label: 'Third' }
                ],
                selectedIndex: 0
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();
        });

        it('should select the tab specified by selectedIndex', () => {
            const tabGroup = fixture.nativeElement.querySelector('mat-tab-group');
            expect(tabGroup).toBeTruthy();

            const config = component.config();
            expect(config.selectedIndex).toBe(0);
        });

        it('should emit tabChanged event when tab is selected', () => {
            let emittedIndex = -1;
            component.tabChanged.subscribe((index: number) => {
                emittedIndex = index;
            });

            component.onTabChanged({ index: 1 } as MatTabChangeEvent);
            expect(emittedIndex).toBe(1);
        });
    });

    describe('Tab Rendering', () => {
        it('should render tabs with labels', () => {
            const config: TabsConfig = {
                tabs: [
                    { label: 'Tab One' },
                    { label: 'Tab Two' }
                ]
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            const tabLabels = fixture.nativeElement.querySelectorAll('.mat-mdc-tab');
            expect(tabLabels.length).toBe(2);
        });

        it('should render tabs with icons', () => {
            const config: TabsConfig = {
                tabs: [
                    { label: 'Home', icon: 'home' },
                    { label: 'Settings', icon: 'settings' }
                ]
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            const icons = fixture.nativeElement.querySelectorAll('orca-icon');
            expect(icons.length).toBe(2);
        });

        it('should apply disabled state to tabs', () => {
            const config: TabsConfig = {
                tabs: [
                    { label: 'Enabled', disabled: false },
                    { label: 'Disabled', disabled: true }
                ]
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            const tabs = fixture.nativeElement.querySelectorAll('.mat-mdc-tab');
            expect(tabs[1].classList.contains('mat-mdc-tab-disabled')).toBeTruthy();
        });
    });

    describe('Tab Alignment', () => {
        it('should apply center alignment when configured', () => {
            const config: TabsConfig = {
                tabs: [{ label: 'Tab 1' }],
                alignment: 'center'
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            const tabGroup = fixture.nativeElement.querySelector('mat-tab-group');
            expect(tabGroup.classList.contains('mat-tab-group-center')).toBeTruthy();
        });

        it('should apply start alignment by default', () => {
            const config: TabsConfig = {
                tabs: [{ label: 'Tab 1' }]
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            const tabGroup = fixture.nativeElement.querySelector('mat-tab-group');
            expect(tabGroup.classList.contains('mat-tab-group-start')).toBeTruthy();
        });
    });

    describe('Header Position', () => {
        it('should position header above content by default', () => {
            const config: TabsConfig = {
                tabs: [{ label: 'Tab 1' }]
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            expect(component.config().headerPosition).toBe('above');
        });

        it('should position header below content when configured', () => {
            const config: TabsConfig = {
                tabs: [{ label: 'Tab 1' }],
                headerPosition: 'below'
            };
            fixture.componentRef.setInput('config', config);
            fixture.detectChanges();

            expect(component.config().headerPosition).toBe('below');
        });
    });
});
