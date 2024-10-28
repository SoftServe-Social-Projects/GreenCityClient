export interface FactOfTheDay {
  id: number;
  factOfTheDayTranslations: {
    content: string;
    languageCode: string;
  }[];
}
