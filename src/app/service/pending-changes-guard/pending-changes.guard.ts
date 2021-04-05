import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { WarningPopUpComponent } from '@shared/components';
import {take} from 'rxjs/operators';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
  previousPath: string;
  popupConfig: {
    hasBackdrop: boolean,
    closeOnNavigation: boolean,
    disableClose: boolean,
    panelClass: string,
    data: {
      popupTitle: string,
      popupSubtitle: string,
      popupConfirm: string,
      popupCancel: string
    }
  };
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  constructor(public dialog: MatDialog) {}

  canDeactivate(component: ComponentCanDeactivate): boolean | Promise<boolean> {
    if (component.canDeactivate()) {
      return true;
    } else {
      const matDialogRef = this.dialog.open(WarningPopUpComponent, component.popupConfig);

      return new Promise(resolve => {
        matDialogRef.afterClosed().pipe(take(1)).subscribe(confirm => {
          if (!confirm) {
            history.pushState({navigationId: 2}, '', component.previousPath);
          }
          resolve(confirm);
        });
      });
    }
  }
}
