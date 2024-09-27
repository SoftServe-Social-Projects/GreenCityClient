import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PROFILE_IMAGES } from 'src/app/main/image-pathes/profile-images';
import { Router } from '@angular/router';
import { AchievementService } from '@global-service/achievement/achievement.service';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { AchievementDto } from '@global-models/achievement/AchievementDto';
import { calendarImage } from '@shared/components/calendar-base/calendar-image';
import { MatDialog } from '@angular/material/dialog';
import { AchievementsModalComponent } from './achievements-modal/achievements-modal.component';

@Component({
  selector: 'app-users-achievements',
  templateUrl: './users-achievements.component.html',
  styleUrls: ['./users-achievements.component.scss']
})
export class UsersAchievementsComponent implements OnInit, OnDestroy {
  itemsPerPage = 3;
  private slideIndex = 0;
  private totalPages = 0;

  achievements: AchievementDto[] = [];
  achievementsToShow: AchievementDto[] = [];
  amountOfAchievements: number;

  achievementsImages = PROFILE_IMAGES.achs;
  currentLang: string;
  destroy$ = new Subject();

  arrows = calendarImage;
  itemsMap = { 768: 3, 576: 5, 320: 3 };

  @ViewChild('slider', { static: true }) slider: ElementRef;
  @ViewChild('nextArrow', { static: false }) nextArrow: ElementRef;
  @ViewChild('previousArrow', { static: false }) previousArrow: ElementRef;

  constructor(
    private router: Router,
    private achievementService: AchievementService,
    private localStorageService: LocalStorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.localStorageService.languageBehaviourSubject.subscribe((lang) => (this.currentLang = lang));
    this.showAchievements();
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.calculateAchievementsToShow();
      });
  }

  showAchievements() {
    this.achievementService
      .getAchievements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (achievements) => {
          this.achievements = achievements;
          this.amountOfAchievements = achievements.length;
          this.totalPages = Math.ceil(this.amountOfAchievements / this.itemsPerPage);
          this.calculateAchievementsToShow();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  calculateAchievementsToShow() {
    if (this.achievements.length > 0) {
      this.itemsPerPage = this.getAchievementsToShow();
      const startIndex = this.slideIndex * this.itemsPerPage;
      const endIndex = Math.min(startIndex + this.itemsPerPage, this.achievements.length);
      this.achievementsToShow = this.achievements.slice(startIndex, endIndex);
    }
  }

  getAchievementsToShow() {
    const resolution = Object.keys(this.itemsMap)
      .map(Number)
      .sort((a, b) => b - a)
      .find((resolution) => window.innerWidth >= resolution);
    return resolution !== undefined ? this.itemsMap[resolution] : 0;
  }

  changeAchievements(isNext: boolean) {
    if (isNext) {
      this.slideIndex = (this.slideIndex + 1) % this.totalPages;
    } else {
      this.slideIndex = (this.slideIndex - 1 + this.totalPages) % this.totalPages;
    }
    this.calculateAchievementsToShow();
  }

  shouldShowArrows(): boolean {
    return this.achievements.length > this.itemsPerPage && window.innerWidth < 768;
  }

  openDialog() {
    this.dialog.open(AchievementsModalComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      panelClass: ['custom-dialog-container'],
      data: {}
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
