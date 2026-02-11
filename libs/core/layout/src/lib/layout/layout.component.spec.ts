import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SidebarComponent, SidebarItem, TopbarAction, TopbarComponent, TopbarConfig } from '@orca/design-system';
import * as AppLayoutQuery from '../queries/app-layout.query';
import { LayoutComponent } from './layout.component';
import { ProjectsService } from '@orca/core/projects';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

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
    let mockProjectsService: any;

    beforeEach(async () => {
        mockProjectsService = {
            detectProject: jest.fn().mockReturnValue(Promise.resolve({
                project: { name: 'Test Project' }
            }))
        };

        jest.spyOn(AppLayoutQuery, 'injectAppLayoutConfig').mockReturnValue({
            data: signal({
                sidebar: { routes: [] },
            })
        } as any);

        await TestBed.configureTestingModule({
            imports: [LayoutComponent],
            providers: [
                provideTanStackQuery(new QueryClient()),
                { provide: ProjectsService, useValue: mockProjectsService }
            ]
        })
            .overrideComponent(LayoutComponent, {
                remove: { imports: [SidebarComponent, TopbarComponent] },
                add: { imports: [MockSidebarComponent, MockTopbarComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // Wait for query to resolve
        await fixture.whenStable();
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

    it('should display project name', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fixture.detectChanges();
        expect(component.projectName()).toBe('Test Project');
    });
});
