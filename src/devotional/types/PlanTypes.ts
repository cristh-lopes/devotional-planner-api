export interface Plan {
  _days: Day[];
}

export interface Day {
  _n: string;
  _passage: Passage | Passage[];
}

export interface Passage {
  _start: PassagePoint;
  _end: PassagePoint;
}

export interface PassagePoint {
  _book: string;
  _chapter: string;
  _verse: string;
}
