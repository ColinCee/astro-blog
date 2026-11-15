// What the window's scripts share. main.ts builds it once and hands it to
// the lower half (projects.ts), which loads later and must work with the same
// focus, the same rows and the same opening round as the top half.
export interface WindowCtx {
  win: HTMLElement;
  /** The grid of panels (.win__app); the state classes live on it. */
  app: HTMLElement;
  /** The reader asked for less motion: nothing plays. */
  still: boolean;
  /** The one focus. A name is a panel's data-pn; "" is no panel. */
  focus: {
    set(name: string): void;
    current(): string;
    /** Where the focus rests: the panel the keyboard is in, or writing. */
    rest(): string;
    onChange(fn: () => void): void;
    /** Looks again at where the focus belongs, after the layout changed. */
    track(): void;
  };
  posts: {
    rows: HTMLAnchorElement[];
    /** Marks the rows whose post the open project is tied to. */
    mark(tied: (slug: string) => boolean): void;
  };
  /** The opening round, in which the focus visits each panel once. */
  boot: {
    running(): boolean;
    onVisit(fn: (name: string) => void): void;
    onEnd(fn: () => void): void;
  };
}
