import { Bible, Verse } from "../modules/bible/bible.types";
import { Passage } from "../modules/plan/plan.types";

export class PassageRenderer {
  constructor(private bible: Bible) {}

  renderPassages(passages: Passage[]): string[] {
    return passages.map((p) =>
      this.render(
        p._start._book,
        Number(p._start._chapter),
        p._start._verse,
        p._end._book,
        Number(p._end._chapter),
        p._end._verse
      )
    );
  }

  private render(
    startBook: string,
    startChapter: number,
    startVerse: string,
    endBook: string,
    endChapter: number,
    endVerse: string
  ): string {
    const books = this.bible._bible._book;

    const bookStart = books.find(
      (b) => b._abbrev.toLowerCase() === startBook.toLowerCase()
    );
    const bookEnd = books.find(
      (b) => b._abbrev.toLowerCase() === endBook.toLowerCase()
    );

    if (!bookStart || !bookEnd) return `Livro não encontrado: ${startBook}`;

    let text = "";
    let stop = false;

    for (let c = startChapter; c <= endChapter; c++) {
      const book = c === startChapter ? bookStart : bookEnd;
      const chapter = book._chapter.find((ch) => Number(ch._number) === c);
      if (!chapter) continue;

      text += `\n*_📖 ${book._name.toUpperCase()} ${c}_*\n`;

      for (const verse of chapter._verse) {
        const num = Number(verse._number);

        if (c === startChapter && num < Number(startVerse)) continue;
        if (
          c === endChapter &&
          endVerse !== "final" &&
          num > Number(endVerse)
        ) {
          stop = true;
          break;
        }

        text += `*${verse._number}.* ${verse._text}\n`;
      }

      text += `*───────────────*\n`;
      if (stop) break;
    }

    return text.trim();
  }
}
