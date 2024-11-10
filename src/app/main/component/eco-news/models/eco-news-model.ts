export interface EcoNewsModel {
  author: {
    id: number;
    name: string;
  };
  content: string;
  countComments: number;
  creationDate: string;
  id: number;
  imagePath: string;
  likes: number;
  shortInfo: string;
  source: string;
  tags: Array<string>;
  tagsEn: Array<string>;
  tagsUa: Array<string>;
  title: string;
  countOfEcoNews?: number;
  favorite?: boolean;
}
