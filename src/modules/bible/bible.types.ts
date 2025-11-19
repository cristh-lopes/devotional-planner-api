export interface Bible {
  _bible: {
    _book: Book[];
  };
}

export interface Book {
  _abbrev: string;
  _name: string;
  _chapters: string;
  _chapter: Chapter[];
}

export interface Chapter {
  _number: string;
  _verse: Verse[];
}

export interface Verse {
  _number: string;
  _text: string;
}
