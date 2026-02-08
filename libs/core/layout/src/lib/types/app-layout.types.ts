export interface AppLayoutConfig {
    sidebar: {
        routes: Array<{ path: string; label: string; icon?: string }>;
    };
    topbar: {
        title: string;
        logoUrl: string;
    };
}
