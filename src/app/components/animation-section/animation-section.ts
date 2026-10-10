import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Translation } from '../../i18n/translation';
import { VideoPlayer } from '../video-player/video-player';

type SwiperContainerEl = HTMLElement & { initialize: () => void };

@Component({
  selector: 'app-animation-section',
  imports: [VideoPlayer],
  templateUrl: './animation-section.html',
  styleUrl: './animation-section.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.reel-open]': 'galleryOpen()',
  },
})
export class AnimationSection {
  protected readonly t = inject(Translation).t;

  /** Gallery order. Add files to public/assets/animation/ and list them here.
   *  Entries have to stay under GitHub's 100MB-per-file ceiling, so the full
   *  cuts of 'bad day' and 'Bloop' are kept out of the repo. */
  protected readonly reels = signal<string[]>([
    'assets/animation/tank.mp4',
    'assets/animation/girl.mp4',
  ]);

  /** Short excerpt looping inline in the section. */
  protected readonly featured = signal('assets/animation/bad-day-2.mp4');

  protected readonly galleryOpen = signal(false);

  /** Autoplay can be refused (power saving, data saver, browser policy).
   *  When that happens the section offers a manual play control instead of
   *  sitting on an empty dark rectangle. */
  protected readonly playbackBlocked = signal(false);

  private readonly inView = signal(false);

  private readonly featuredVideo = viewChild<ElementRef<HTMLVideoElement>>('featuredEl');
  private readonly gallerySwiper = viewChild<ElementRef<SwiperContainerEl>>('gallerySwiper');
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private previousOverflow = '';

  constructor() {
    // A looping video keeps decoding frames even after the section has
    // scrolled away, which shows up as jank everywhere else on the page.
    afterNextRender(() => {
      const video = this.featuredVideo()?.nativeElement;
      if (!video) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => this.inView.set(entries.some((entry) => entry.isIntersecting)),
        { threshold: 0.15 },
      );
      observer.observe(video);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // Playback follows state rather than one-off calls, so closing the overlay
    // resumes the reel on its own instead of leaving it paused for good.
    effect(() => {
      const video = this.featuredVideo()?.nativeElement;
      if (!video) {
        return;
      }
      if (this.inView() && !this.galleryOpen()) {
        this.tryPlay(video);
      } else {
        video.pause();
      }
    });

    // Deferred init: the slider only exists once the overlay is rendered.
    effect(() => {
      const swiper = this.gallerySwiper();
      if (!swiper) {
        return;
      }
      const el = swiper.nativeElement;
      Object.assign(el, {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        keyboard: true,
        navigation: true,
        on: { slideChange: () => this.pauseGalleryVideos() },
      });
      el.initialize();
    });
  }

  /** Called from the fallback control, so it runs inside a user gesture. */
  protected resumePlayback(): void {
    const video = this.featuredVideo()?.nativeElement;
    if (video) {
      this.tryPlay(video);
    }
  }

  protected openGallery(): void {
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.galleryOpen.set(true);
  }

  @HostListener('document:keydown.escape')
  protected closeGallery(): void {
    if (!this.galleryOpen()) {
      return;
    }
    this.pauseGalleryVideos();
    this.document.body.style.overflow = this.previousOverflow;
    this.galleryOpen.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeGallery();
    }
  }

  private tryPlay(video: HTMLVideoElement): void {
    // The property, not just the attribute: some engines only consult this
    // when deciding whether autoplay is allowed.
    video.muted = true;
    void video.play().then(
      () => this.playbackBlocked.set(false),
      (error: unknown) => {
        // pause() interrupting a pending play() rejects with AbortError; that is
        // a scroll race, not a policy refusal, and the next in-view pass retries.
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          this.playbackBlocked.set(true);
        }
      },
    );
  }

  /** Stops whatever was left playing on the slide we just moved away from. */
  private pauseGalleryVideos(): void {
    const el = this.gallerySwiper()?.nativeElement;
    el?.querySelectorAll('video').forEach((video) => video.pause());
  }
}
