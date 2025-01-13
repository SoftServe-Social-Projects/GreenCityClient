import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BonusesModel } from './models/BonusesModel';
import { BonusModel } from './models/BonusModel';
import { BonusesService } from './services/bonuses.service';
import { Subject, throwError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-ubs-user-bonuses',
  templateUrl: './ubs-user-bonuses.component.html',
  styleUrls: ['./ubs-user-bonuses.component.scss']
})
export class UbsUserBonusesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['dateOfEnrollment', 'amount', 'reason'];
  dataSource = new MatTableDataSource<BonusModel>();
  totalBonuses: number;
  isLoading = true;
  bonusesList: BonusModel[] = [];
  currentLang: string;
  destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    private snackBar: MatSnackBarComponent,
    private bonusesService: BonusesService,
    private localStorage: LocalStorageService
  ) {}

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.getBonusesData();
    this.dataSource.sort = this.sort;
    this.subscribeToLangChange();
    this.currentLang = this.localStorage.getCurrentLanguage();
  }

  getBonusesData() {
    this.isLoading = true;
    this.bonusesService
      .getUserBonusesWithPaymentHistory()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res: BonusesModel) => {
          this.bonusesList = res.ubsUserBonuses;
          this.dataSource.data = res.ubsUserBonuses;
          this.totalBonuses = res.userBonuses;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.openSnackBar('error');
          return throwError(error);
        }
      });
  }

  sortData(sort: Sort) {
    const data = this.bonusesList.slice();
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return this.compare(new Date(a.dateOfEnrollment).getDate(), new Date(b.dateOfEnrollment).getDate(), isAsc);
    });

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return this.compare(a.amount, b.amount, isAsc);
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  passOrderIdToRedirect(orderId: number): void {
    this.localStorage.setOrderIdToRedirect(orderId);
  }

  subscribeToLangChange() {
    this.localStorage.languageSubject.pipe(takeUntil(this.destroy)).subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }
}
