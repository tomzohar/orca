import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent, SidebarItem, TopbarAction, TopbarComponent, TopbarConfig } from '@orca/design-system';
import * as AppLayoutQuery from '../queries/app-layout.query';
import { LayoutComponent } from './layout.component';

@Component({
    selector: 'orca-sidebar',
    standalone: true,
    template: ''
})
class MockSidebarComponent {
    config = input.required<any>();
    itemClick = output<SidebarItem>();
}

@Component({
    selector: 'orca-topbar',
    standalone: true,
    template: ''
})
class MockTopbarComponent {
    config = input.required<TopbarConfig>();
    actionClick = output<TopbarAction>();
}

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(async () => {
        jest.spyOn(AppLayoutQuery, 'injectAppLayoutConfig').mockReturnValue({
            data: signal({
                sidebar: { routes: [] },
                topbar: { title: 'Test App' }
            })
        } as any);

        await TestBed.configureTestingModule({
            imports: [LayoutComponent],
        })
            .overrideComponent(LayoutComponent, {
                remove: { imports: [SidebarComponent, TopbarComponent] },
                add: { imports: [MockSidebarComponent, MockTopbarComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit sidebarItemClick when sidebar item is clicked', () => {
        const spy = jest.spyOn(component.sidebarItemClick, 'emit');
        const mockItem = { id: '1', label: 'Test', icon: { name: 'home' } };

        component.onSidebarItemClick(mockItem);

        expect(spy).toHaveBeenCalledWith(mockItem);
    });

    it('should emit topbarActionClick when topbar action is clicked', () => {
        const spy = jest.spyOn(component.topbarActionClick, 'emit');
        const mockAction = { id: '1', label: 'Action' };

        component.onTopbarActionClick(mockAction);

        expect(spy).toHaveBeenCalledWith(mockAction);
    });
});
