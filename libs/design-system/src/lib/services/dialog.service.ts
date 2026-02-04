import { Injectable, inject, Type, TemplateRef } from '@angular/core';
import { Dialog, DialogConfig as CdkDialogConfig, DialogRef } from '@angular/cdk/dialog';
import { DialogConfig } from '../types/component.types';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private cdkDialog = inject(Dialog);

    open<R = unknown, D = unknown>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        componentOrTemplate: Type<any> | TemplateRef<any>,
        config: DialogConfig & { data?: D } = {}
    ): DialogRef<R> {
        const cdkConfig: CdkDialogConfig<D> = {
            data: config.data,
            disableClose: config.disableClose,
            hasBackdrop: config.hasBackdrop ?? true,
            backdropClass: config.backdropClass || 'orca-dialog-backdrop',
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.cdkDialog.open<R, D>(componentOrTemplate as any, cdkConfig as any);
    }

    closeAll(): void {
        this.cdkDialog.closeAll();
    }
}
