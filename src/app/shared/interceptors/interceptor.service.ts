import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { updateAccessTokenLink } from '../../main/links';
import { LocalStorageService } from '../../main/service/localstorage/local-storage.service';
import { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } from '../../main/http-response-status';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { UserOwnAuthService } from '@auth-service/user-own-auth.service';
import { UBSOrderFormService } from 'src/app/ubs/ubs/services/ubs-order-form.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '@global-auth/auth-modal/auth-modal.component';

interface NewTokenPair {
  accessToken: string;
  refreshToken: string;
}

interface EmployeesError {
  name: string;
  message: string;
}

const blackList = ['https://csb'];

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private refreshTokenSubject: BehaviorSubject<NewTokenPair> = new BehaviorSubject<NewTokenPair>(null);
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService,
    private router: Router,
    private userOwnAuthService: UserOwnAuthService,
    private ubsOrderFormService: UBSOrderFormService,
    private dialog: MatDialog
  ) {}

  /**
   * Intercepts all HTTP requests, adds access token to authentication header (except authentication requests),
   * intercepts 400, 401, and 403 error responses.
   *
   * @param req - {@link HttpRequest}
   * @param next - {@link HttpHandler}
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!window.navigator.onLine) {
      // if there is no internet, open Error Window
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          this.openErrorWindow('snack-bar.error.no-internet');
          return EMPTY;
        })
      );
    } else {
      if (blackList.some((url) => req.url.includes(url))) {
        return next.handle(req);
      }

      // else return the normal request
      if (this.localStorageService.getAccessToken()) {
        req = this.addAccessTokenToHeader(req, this.localStorageService.getAccessToken());
      }
      if (this.isQueryWithSecurity(req.url)) {
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 0) {
              this.openErrorWindow('Error');
            }
            return throwError(() => error);
          })
        );
      }
      if (this.isQueryWithProcessOrder(req.url)) {
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status >= 400) {
              this.ubsOrderFormService.setOrderResponseErrorStatus(true);
            }
            if (error.status === 400 && error.error.includes(`User doesn't have enough bonus points.`)) {
              this.openErrorWindow('snack-bar.error.not-enough-points');
            }
            if (error.status === 400 && error.error.includes(`The certificate has been used before or is not activated.`)) {
              this.openErrorWindow('snack-bar.error.cartificate-not-valid');
            }
            return throwError(() => error);
          })
        );
      }
      if (req.url.includes('/admin/ubs-employee')) {
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status !== UNAUTHORIZED) {
              let message: string;
              switch (true) {
                case error?.error?.length > 0:
                  message = error?.error.map((errorItem: EmployeesError) => `${errorItem.name}: ${errorItem.message}`).join(', ');
                  break;
                case !!error.error?.message.length:
                  message = error.error?.message;
                  break;
                default:
                  message = 'Error';
                  break;
              }

              this.openErrorWindow(message);
              return throwError(() => error);
            }
            return this.handleUnauthorized(req, next);
          })
        );
      }
      if (req.url.includes('/events/addAttender')) {
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === BAD_REQUEST) {
              return EMPTY;
            }
          })
        );
      }
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error?.message.includes(`Tariff or location is deactivated.`)) {
          return throwError(() => error);
        }

        if (this.checkIfErrorStatusIs(error.status, [BAD_REQUEST, FORBIDDEN])) {
          const noErrorErrorMessage = error.message ?? 'Error';
          const message = error.error?.message ?? noErrorErrorMessage;
          this.openErrorWindow(message);
          return throwError(() => error);
        }
        if (this.checkIfErrorStatusIs(error.status, [UNAUTHORIZED])) {
          return this.handleUnauthorized(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Adds access token to authentication header.
   *
   * @param req - {@link HttpRequest}
   * @param accessToken - {@link string} - access token key.
   */
  addAccessTokenToHeader(req: HttpRequest<any>, accessToken: string) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  openErrorWindow(message: string): void {
    this.snackBar.openSnackBar(message);
  }

  private isQueryWithSecurity(url: string): boolean {
    return url.includes('ownSecurity') || url.includes('googleSecurity');
  }

  private isQueryWithProcessOrder(url: string): boolean {
    return url.includes('processOrder');
  }

  private checkIfErrorStatusIs(errorStatusCode: number, statusCodesToVerify: number[]): boolean {
    return statusCodesToVerify.some((code) => errorStatusCode === code);
  }

  /**
   * Handles 401 response. It tries to get new access/refresh token pair with refresh token.
   * All of the rest request are put on hold.
   *
   * @param req - {@link HttpRequest}
   * @param next - {@link HttpHandler}
   */
  private handleUnauthorized(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.getNewTokenPair(this.localStorageService.getRefreshToken()).pipe(
        catchError((error: HttpErrorResponse) => this.handleRefreshTokenIsNotValid(error)),
        switchMap((newTokenPair: NewTokenPair) => {
          this.localStorageService.setAccessToken(newTokenPair.accessToken);
          this.localStorageService.setRefreshToken(newTokenPair.refreshToken);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newTokenPair);
          return next.handle(this.addAccessTokenToHeader(req, newTokenPair.accessToken));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((newTokenPair: NewTokenPair) => newTokenPair !== null),
        take(1),
        switchMap((newTokenPair: NewTokenPair) => next.handle(this.addAccessTokenToHeader(req, newTokenPair.accessToken))),
        catchError(() => of<HttpEvent<any>>())
      );
    }
  }

  /**
   * Handles a situation when refresh token is expired.
   *
   * @param error - {@link HttpErrorResponse}
   */
  private handleRefreshTokenIsNotValid(error: HttpErrorResponse): Observable<HttpEvent<any>> {
    const currentUrl = this.router.url;
    const isUBS = currentUrl.includes('ubs');
    this.localStorageService.clear();
    this.dialog.closeAll();
    this.userOwnAuthService.isLoginUserSubject.next(false);
    this.localStorageService.setUbsRegistration(isUBS);
    this.dialog
      .open(AuthModalComponent, {
        hasBackdrop: true,
        closeOnNavigation: true,
        panelClass: ['custom-dialog-container'],
        data: {
          popUpName: 'sign-in'
        }
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.isRefreshing = false;
        this.userOwnAuthService.isLoginUserSubject.getValue()
          ? this.router.navigateByUrl(currentUrl)
          : this.router.navigate(isUBS ? ['ubs'] : ['greenCity']);
      });

    return of<HttpEvent<any>>();
  }

  /**
   * Send refresh token in order to get new access/refresh token pair.
   *
   * @param refreshToken - {@link string} refresh token.
   */
  private getNewTokenPair(refreshToken: string): Observable<NewTokenPair> {
    return this.http.get<NewTokenPair>(`${updateAccessTokenLink}?refreshToken=${refreshToken}`);
  }
}
