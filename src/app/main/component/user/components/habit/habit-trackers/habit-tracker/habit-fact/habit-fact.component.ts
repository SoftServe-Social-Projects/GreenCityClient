import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HabitFactDto } from 'src/app/main/model/habit-fact/HabitFactDto';
import { HabitFactService } from 'src/app/main/service/habit-fact/habit-fact.service';
import { HabitDictionaryDto } from 'src/app/main/model/habit/HabitDictionaryDto';
import { LanguageService } from 'src/app/main/i18n/language.service';

@Component({
  selector: 'app-habit-fact',
  templateUrl: './habit-fact.component.html',
  styleUrls: ['./habit-fact.component.scss']
})
export class HabitFactComponent implements OnInit {
  $fact: Observable<HabitFactDto>;
  @Input() habitDictionary: HabitDictionaryDto;

  constructor(
    private service: HabitFactService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.$fact = this.service.getHabitFact(this.habitDictionary.id, this.languageService.getCurrentLanguage());
  }
}
