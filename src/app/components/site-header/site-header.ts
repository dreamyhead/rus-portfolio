import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { LANGS, Lang, Translation } from '../../i18n/translation';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.menu-open]': 'menuOpen()',
  },
})
export class SiteHeader {
  private readonly translation = inject(Translation);
  private readonly document = inject(DOCUMENT);
  private previousOverflow = '';

  protected readonly t = this.translation.t;
  protected readonly lang = this.translation.lang;
  protected readonly langs = LANGS;

  protected readonly menuOpen = signal(false);

  protected setLang(lang: Lang): void {
    this.translation.setLang(lang);
  }

  protected toggleMenu(): void {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }

  @HostListener('document:keydown.escape')
  protected closeMenu(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.document.body.style.overflow = this.previousOverflow;
    this.menuOpen.set(false);
  }

  private openMenu(): void {
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.menuOpen.set(true);
  }
}
