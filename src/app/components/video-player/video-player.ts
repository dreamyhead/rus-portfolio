import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Translation } from '../../i18n/translation';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mousemove)': 'showControls()',
    '(mouseleave)': 'scheduleHideControls()',
  },
})
export class VideoPlayer {
  readonly src = input.required<string>();
  readonly poster = input<string>();

  protected readonly playing = signal(false);
  protected readonly buffering = signal(false);
  protected readonly muted = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly bufferedEnd = signal(0);
  protected readonly controlsHidden = signal(false);
  protected readonly isFullscreen = signal(false);

  protected readonly progressPercent = computed(() => {
    const duration = this.duration();
    return duration ? (this.currentTime() / duration) * 100 : 0;
  });
  protected readonly bufferedPercent = computed(() => {
    const duration = this.duration();
    return duration ? (this.bufferedEnd() / duration) * 100 : 0;
  });
  protected readonly formattedCurrent = computed(() => formatTime(this.currentTime()));
  protected readonly formattedDuration = computed(() => formatTime(this.duration()));

  private readonly t = inject(Translation).t;
  protected readonly playLabel = computed(() =>
    this.playing() ? this.t().player.pause : this.t().player.play,
  );
  protected readonly muteLabel = computed(() =>
    this.muted() ? this.t().player.unmute : this.t().player.mute,
  );
  protected readonly fullscreenLabel = computed(() =>
    this.isFullscreen() ? this.t().player.exitFullscreen : this.t().player.fullscreen,
  );

  private readonly videoEl = viewChild.required<ElementRef<HTMLVideoElement>>('videoEl');
  private readonly progressEl = viewChild.required<ElementRef<HTMLDivElement>>('progressEl');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private seeking = false;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.hideTimer));
  }

  @HostListener('document:fullscreenchange')
  protected onFullscreenChange(): void {
    this.isFullscreen.set(document.fullscreenElement === this.host.nativeElement);
  }

  protected togglePlay(): void {
    const video = this.videoEl().nativeElement;
    if (video.paused || video.ended) {
      void video.play();
    } else {
      video.pause();
    }
  }

  protected onPlayStateChange(playing: boolean): void {
    this.playing.set(playing);
    if (playing) {
      this.scheduleHideControls();
    } else {
      this.showControls();
    }
  }

  protected onTimeUpdate(): void {
    if (this.seeking) {
      return;
    }
    this.currentTime.set(this.videoEl().nativeElement.currentTime);
  }

  protected onLoadedMetadata(): void {
    this.duration.set(this.videoEl().nativeElement.duration || 0);
  }

  protected onProgress(): void {
    const buffered = this.videoEl().nativeElement.buffered;
    this.bufferedEnd.set(buffered.length ? buffered.end(buffered.length - 1) : 0);
  }

  protected toggleMute(): void {
    const video = this.videoEl().nativeElement;
    video.muted = !video.muted;
    this.muted.set(video.muted);
  }

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void this.host.nativeElement.requestFullscreen();
    }
  }

  protected onProgressPointerDown(event: PointerEvent): void {
    this.seeking = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.seekToEvent(event);
  }

  protected onProgressPointerMove(event: PointerEvent): void {
    if (this.seeking) {
      this.seekToEvent(event);
    }
  }

  protected onProgressPointerUp(event: PointerEvent): void {
    if (!this.seeking) {
      return;
    }
    this.seeking = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  protected showControls(): void {
    this.controlsHidden.set(false);
    this.scheduleHideControls();
  }

  protected scheduleHideControls(): void {
    clearTimeout(this.hideTimer);
    if (!this.playing()) {
      return;
    }
    this.hideTimer = setTimeout(() => this.controlsHidden.set(true), 2500);
  }

  private seekToEvent(event: PointerEvent): void {
    const track = this.progressEl().nativeElement;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const time = ratio * this.duration();
    this.currentTime.set(time);
    this.videoEl().nativeElement.currentTime = time;
  }
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
