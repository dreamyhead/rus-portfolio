import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
} from '@angular/core';
import { Translation } from '../../i18n/translation';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  /** The page reserves this much room so the footer has something to be
   *  revealed from behind; it is measured rather than hard-coded because the
   *  footer's height follows its content and the active language. */
  readonly heightChange = output<number>();

  protected readonly t = inject(Translation).t;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const observer = new ResizeObserver(() => this.heightChange.emit(el.offsetHeight));
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected readonly email = 'kaimarsen@mail.ru';
  protected readonly telegram = 'DrRuus';
}
