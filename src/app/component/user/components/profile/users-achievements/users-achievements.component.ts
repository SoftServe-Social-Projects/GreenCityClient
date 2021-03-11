import { Component, OnInit } from '@angular/core';
import { PROFILE_IMAGES } from 'src/app/image-pathes/profile-images';

@Component({
  selector: 'app-users-achievements',
  templateUrl: './users-achievements.component.html',
  styleUrls: ['./users-achievements.component.scss'],
})
export class UsersAchievementsComponent implements OnInit {
  public achievementsImages = PROFILE_IMAGES.achs;

  constructor() {}

  ngOnInit() {}
}
