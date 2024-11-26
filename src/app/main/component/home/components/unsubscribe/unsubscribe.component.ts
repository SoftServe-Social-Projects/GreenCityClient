import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '@global-service/subscription/subscription.service';
import { take } from 'rxjs';
import { footerIcons } from 'src/app/main/image-pathes/footer-icons';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit {
  token: string;
  type: string;
  message: string;
  isLoading = false;
  isSuccess = false;
  isError = false;
  logo = footerIcons.greenCityLogo;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.type = params['type'];
    });
  }

  getDynamicTranslationKey(): string {
    return `homepage.subscription.type.${this.type}`;
  }

  onUnsubscribe(): void {
    this.isLoading = true;
    this.subscriptionService
      .unsubscribe(this.token)
      .pipe(take(1))
      .subscribe({
        next: (): void => {
          this.isLoading = false;
          this.isSuccess = true;
        },
        error: (): void => {
          this.isLoading = false;
          this.isError = true;
        }
      });
  }
}
