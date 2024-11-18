import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-habit-tracker-date',
  templateUrl: './habit-tracker-date.component.html',
  styleUrls: ['./habit-tracker-date.component.scss']
})
export class HabitTrackerDateComponent implements OnInit {
  @Input() habitCreationDate: Date;
  @Input() dayNumber: number;
  creationMonth: string;

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.creationMonth = this.languageService.getLocalizedMonth(new Date(this.habitCreationDate).getMonth());
  }
}
