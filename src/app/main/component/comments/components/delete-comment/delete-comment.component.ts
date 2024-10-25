import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { CommentsDTO } from '../../models/comments-model';
import { WarningPopUpComponent } from '@shared/components/warning-pop-up/warning-pop-up.component';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-comment',
  templateUrl: './delete-comment.component.html',
  styleUrls: ['./delete-comment.component.scss']
})
export class DeleteCommentComponent {
  @Input() public entityId: number;
  @Input() public element: CommentsDTO;
  @Input() public dataType: string;
  @Output() public elementsList = new EventEmitter<number>();
  deleteIcon = 'assets/img/comments/delete.png';

  constructor(
    private commentsService: CommentsService,
    private dialog: MatDialog
  ) {}

  openPopup(): void {
    const dialogRef = this.dialog.open(WarningPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'popup-dialog-container',
      data: {
        popupTitle: `homepage.eco-news.comment.${this.dataType}-popup.title`,
        popupConfirm: `homepage.eco-news.comment.${this.dataType}-popup.confirm`,
        popupCancel: `homepage.eco-news.comment.${this.dataType}-popup.cancel`
      }
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.commentsService
            .deleteComments(this.element.id)
            .pipe(take(1))
            .subscribe((success) => {
              if (success) {
                this.elementsList.emit(this.element.id);
              }
            });
        }
      });
  }
}
