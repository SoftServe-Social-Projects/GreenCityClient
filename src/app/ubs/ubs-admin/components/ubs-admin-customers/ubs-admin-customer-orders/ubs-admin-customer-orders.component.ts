import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { columnsParamsOrders } from '../columnsParams';
import { AdminCustomersService } from 'src/app/ubs/ubs-admin/services/admin-customers.service';
import { ICustomerOrdersTable } from 'src/app/ubs/ubs-admin/models/customer-orders-table.model';
import { LocalStorageService } from 'src/app/main/service/localstorage/local-storage.service';

@Component({
  selector: 'app-ubs-admin-customer-orders',
  templateUrl: './ubs-admin-customer-orders.component.html',
  styleUrls: ['./ubs-admin-customer-orders.component.scss']
})
export class UbsAdminCustomerOrdersComponent implements OnInit, AfterViewChecked, OnDestroy {
  private id: string;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private sortingColumn: string;
  private sortingType: string;
  private page = 0;

  columns = [];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;
  currentLang: string;
  arrowDirection: string;
  userName: string;
  orders = [];
  isLoading = true;
  isCanScroll = false;
  isTableLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminCustomerService: AdminCustomersService,
    private localStorageService: LocalStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.currentLang = lang;
    });
    this.getOrders();
    this.columns = columnsParamsOrders;
    this.setDisplayedColumns();
  }

  ngAfterViewChecked() {
    if (!this.isLoading) {
      this.cdr.detectChanges();
    }
  }

  private getOrders() {
    this.route.params.subscribe((params) => {
      this.id = params.id;
      this.page = 0;
      this.adminCustomerService
        .getCustomerOrders(this.id, this.page, this.sortingColumn || 'id', this.sortingType || 'ASC')
        .pipe(takeUntil(this.destroy$))
        .subscribe((orders: ICustomerOrdersTable) => {
          this.userName = orders.username;
          this.orders = orders.userOrdersList;
          this.isLoading = false;
          this.dataSource = new MatTableDataSource(this.orders);
          this.page = ++this.page;
          this.checkAmountOrders(orders.userOrdersList);
        });
    });
  }

  private checkAmountOrders(orders) {
    if (this.page < 2 && orders.length === 10) {
      this.isCanScroll = true;
      this.updateOrders();
    }
  }

  onScroll() {
    this.updateOrders();
  }

  private updateOrders() {
    this.isTableLoading = true;
    this.adminCustomerService
      .getCustomerOrders(this.id, this.page, this.sortingColumn || 'id', this.sortingType || 'ASC')
      .pipe(takeUntil(this.destroy$))
      .subscribe((orders: ICustomerOrdersTable) => {
        this.userName = orders.username;
        this.orders = [...this.orders, ...orders.userOrdersList];
        this.dataSource = new MatTableDataSource(this.orders);
        this.page = ++this.page;
        this.isTableLoading = false;
      });
  }

  onSortTable(column: string, sortingType: string) {
    this.sortingColumn = column;
    this.sortingType = sortingType;
    this.arrowDirection = column === this.arrowDirection ? null : column;
    this.getOrders();
  }

  goBack(): void {
    this.router.navigate(['ubs-admin', 'customers']);
  }

  private setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      this.displayedColumns[index] = column.title.key;
    });
  }

  openOrder(id: number): void {
    this.router.navigate([]).then((result) => {
      window.open(`/GreenCityClient/#/ubs-admin/order/${id}`, '_blank');
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
