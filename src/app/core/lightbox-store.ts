import { Service, computed, signal } from '@angular/core';
import { PHOTOS } from '../data/casa';

/**
 * Estado global del visor de fotos. `index` es null cuando está cerrado.
 * Lo comparten hero, galería, lightbox y la barra fija mobile.
 */
@Service()
export class LightboxStore {
  private readonly _index = signal<number | null>(null);

  readonly index = this._index.asReadonly();
  readonly isOpen = computed(() => this._index() !== null);
  readonly photo = computed(() => {
    const i = this._index();
    return i === null ? null : PHOTOS[i];
  });
  readonly total = PHOTOS.length;

  open(index: number): void {
    this._index.set(this.wrap(index));
  }

  close(): void {
    this._index.set(null);
  }

  next(): void {
    this._index.update((i) => (i === null ? i : this.wrap(i + 1)));
  }

  prev(): void {
    this._index.update((i) => (i === null ? i : this.wrap(i - 1)));
  }

  private wrap(i: number): number {
    return (i + this.total) % this.total;
  }
}
