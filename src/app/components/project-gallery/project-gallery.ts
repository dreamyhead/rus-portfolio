import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DOCUMENT,
  ElementRef,
  HostListener,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Translation } from '../../i18n/translation';

type SwiperContainerEl = HTMLElement & { initialize: () => void };

@Component({
  selector: 'app-project-gallery',
  templateUrl: './project-gallery.html',
  styleUrl: './project-gallery.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGallery implements OnDestroy {
  readonly title = input.required<string>();
  readonly images = input.required<string[]>();
  readonly closed = output<void>();

  protected readonly t = inject(Translation).t;

  private readonly swiperEl = viewChild.required<ElementRef<SwiperContainerEl>>('swiperEl');
  private readonly counter = viewChild.required<ElementRef<HTMLElement>>('counter');
  private readonly document = inject(DOCUMENT);
  private readonly previousOverflow = this.document.body.style.overflow;

  constructor() {
    this.document.body.style.overflow = 'hidden';

    // Deferred init so pagination can render the counter into an element of
    // ours; Swiper keeps it in sync, no event plumbing on our side.
    afterNextRender(() => {
      const el = this.swiperEl().nativeElement;
      Object.assign(el, {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        keyboard: true,
        navigation: true,
        pagination: { el: this.counter().nativeElement, type: 'fraction' },
      });
      el.initialize();
    });
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = this.previousOverflow;
  }

  @HostListener('document:keydown.escape')
  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
