// How a card from the Anki deck sounds, as a pitch line for each language.
// The tone is read from the card's own readings (the mark over the pinyin's
// vowel, the digit that ends the jyutping) and drawn as that tone's usual
// five-level contour: 5 is the top of the voice, 1 the bottom.
//
// Pure, so the first card's lines are drawn at build (figures/Anki.astro) and
// the next card's in the browser (projects.ts) by the same code.

export interface Card {
  hanzi: string;
  pinyin: string;
  jyutping: string;
  meaning: string;
}

export interface Tone {
  /** The tone's number; 0 when the reading carries none. */
  n: number;
  /** The contour as polyline points in a 100 by 100 box; "" for no tone. */
  points: string;
  /** How far down the box the line ends, in percent. */
  end: number;
}

const MANDARIN: Record<number, number[]> = {
  1: [5, 5],
  2: [3, 5],
  3: [2, 1, 4],
  4: [5, 1],
};
const CANTONESE: Record<number, number[]> = {
  1: [5, 5],
  2: [2, 5],
  3: [3, 3],
  4: [2, 1],
  5: [2, 3],
  6: [2, 2],
};

// The combining marks pinyin uses, in tone order: macron, acute, caron, grave.
const MARKS = ["\u0304", "\u0301", "\u030c", "\u0300"];

const down = (level: number) => ((5 - level) / 4) * 100;

function tone(n: number, levels: Record<number, number[]>): Tone {
  const line = levels[n] ?? [];
  return {
    n: line.length ? n : 0,
    points: line
      .map((level, k) => `${(k / (line.length - 1)) * 100},${down(level)}`)
      .join(" "),
    end: line.length ? down(line[line.length - 1]) : 0,
  };
}

export function tones(card: Card): { mandarin: Tone; cantonese: Tone } {
  const marked = card.pinyin.normalize("NFD");
  return {
    mandarin: tone(MARKS.findIndex((m) => marked.includes(m)) + 1, MANDARIN),
    cantonese: tone(Number(card.jyutping.match(/[1-6]$/)?.[0] ?? 0), CANTONESE),
  };
}
