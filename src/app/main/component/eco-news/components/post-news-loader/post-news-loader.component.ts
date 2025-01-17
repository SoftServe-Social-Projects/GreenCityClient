import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-post-news-loader',
  templateUrl: './post-news-loader.component.html',
  styleUrls: ['./post-news-loader.component.scss']
})
export class PostNewsLoaderComponent implements OnInit {
  actualYear = new Date().getFullYear();

  constructor(private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle('Eco news');
  }
}
