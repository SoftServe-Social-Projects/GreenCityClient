export interface EcoNewsModel {
  id: number;
  imagePath: string;
  title: string;
  text: string;
  author: {
    id: number;
    name: string;
  };
  tags: Array<NewsTagInterface>;
  creationDate: string;
  likes: number;
  source?: string;
}

export interface NewsTagInterface {
  id: number;
  name: string;
}
