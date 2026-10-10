import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Translation } from '../../i18n/translation';

type SwiperInstance = {
  translate: number;
  translateTo: (translate: number, speed?: number, runCallbacks?: boolean) => void;
};
type SwiperContainerEl = HTMLElement & { initialize: () => void; swiper?: SwiperInstance };

type SkillKey =
  'max3ds' | 'blender' | 'photoshop' | 'archicad' | 'audition' | 'premiere' | 'aftereffects';
type ProjectKey = 'mishka' | 'library' | 'villageHouse' | 'familyHouse';
type Skill = { key: SkillKey; logo?: string };

export type Project = {
  key: ProjectKey;
  title: string;
  year: string;
  cover?: string;
  gallery?: string[];
};

const MISHKA_GALLERY = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(
  (n) => `assets/mishka/${n}.jpg`,
);

const LIBRARY_GALLERY = [
  3, 4, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000,
  130000, 140000, 150000, 160000,
].map((n) => `assets/library/${n}.jpg`);

const photo = (folder: string, file: string) => `assets/${folder}/${encodeURIComponent(file)}`;

const numbered = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${prefix} (${i + 1}).jpg`);

const VILLAGE_HOUSE_GALLERY = [
  ...numbered('kitchen8', 7),
  ...numbered('main-bedroom', 11),
  ...numbered('bedroom', 7),
  ...[10000, 30000, 40000, 50000, 60000, 70000].map((n) => `${n}.jpg`),
].map((file) => photo('village-house', file));

const FAMILY_HOUSE_GALLERY = [
  ...numbered('kitchen', 12),
  ...numbered('main-room', 6),
  ...numbered('kid-room', 6),
  ...numbered('kid-toulette', 5),
].map((file) => photo('family-house', file));

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  protected readonly t = inject(Translation).t;

  protected readonly skills = signal<Skill[]>([
    { key: 'max3ds' },
    { key: 'blender' },
    { key: 'photoshop' },
    { key: 'archicad' },
    { key: 'audition' },
    { key: 'premiere' },
    { key: 'aftereffects' },
  ]);
  /** Drives the skill cards' entrance animation once the section scrolls into view. */
  protected readonly sectionVisible = signal(false);
  /** Tallest timeline card's natural height, applied to every card so they line up in the carousel. */
  protected readonly timelineCardHeightPx = signal<string | null>(null);

  protected readonly projects = signal<Project[]>([
    {
      key: 'mishka',
      title: 'MISHKA LOUNGE KOVROV',
      year: '2025',
      cover: 'assets/mishka/cover.jpg',
      gallery: MISHKA_GALLERY,
    },
    {
      key: 'library',
      title: 'LIBRARY',
      year: '2025',
      cover: 'assets/library/00000.jpg',
      gallery: LIBRARY_GALLERY,
    },
    {
      key: 'villageHouse',
      title: 'VILLAGE HOUSE',
      year: '2025',
      cover: photo('village-house', 'kitchen8 (1).jpg'),
      gallery: VILLAGE_HOUSE_GALLERY,
    },
    {
      key: 'familyHouse',
      title: 'FAMILY HOUSE',
      year: '2026',
      cover: photo('family-house', 'kitchen (5).jpg'),
      gallery: FAMILY_HOUSE_GALLERY,
    },
  ]);

  readonly galleryOpen = output<Project>();

  private readonly aboutSection = viewChild.required<ElementRef<HTMLElement>>('aboutSection');
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectsSwiper =
    viewChild.required<ElementRef<SwiperContainerEl>>('projectsSwiper');
  private readonly prevButton = viewChild.required<ElementRef<HTMLButtonElement>>('prevButton');
  private readonly nextButton = viewChild.required<ElementRef<HTMLButtonElement>>('nextButton');
  private readonly timelineSwiper =
    viewChild.required<ElementRef<SwiperContainerEl>>('timelineSwiper');

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.sectionVisible.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(this.aboutSection().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    afterNextRender(() => {
      const el = this.projectsSwiper().nativeElement;
      Object.assign(el, {
        slidesPerView: 1,
        spaceBetween: 24,
        grabCursor: true,
        keyboard: true,
        breakpoints: {
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
        navigation: {
          prevEl: this.prevButton().nativeElement,
          nextEl: this.nextButton().nativeElement,
        },
      });
      el.initialize();
    });

    afterNextRender(() => {
      const el = this.timelineSwiper().nativeElement;
      Object.assign(el, {
        slidesPerView: 1.15,
        spaceBetween: 16,
        grabCursor: true,
        keyboard: true,
        breakpoints: {
          700: { slidesPerView: 2.3 },
        },
      });
      el.initialize();

      this.measureTimelineCards();
      let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.measureTimelineCards(), 150);
      };
      window.addEventListener('resize', onResize);
      this.destroyRef.onDestroy(() => {
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', onResize);
      });

      // Tugs the carousel a few pixels once on load so it reads as
      // draggable, not static. Moves the swiper's own internal translate
      // (the same thing a drag does) rather than the host element, so the
      // peeking next card reveals itself naturally instead of being cut by
      // the container's edge.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const nudge = setTimeout(() => {
        const swiper = el.swiper;
        if (!swiper) {
          return;
        }
        const start = swiper.translate;
        swiper.translateTo(start - 36, 350, false);
        const settle = setTimeout(() => swiper.translateTo(start, 350, false), 380);
        this.destroyRef.onDestroy(() => clearTimeout(settle));
      }, 700);
      this.destroyRef.onDestroy(() => clearTimeout(nudge));
    });
  }

  /**
   * Resets the height override so every card reports its own natural size,
   * then applies the tallest one back to all of them via a CSS variable.
   */
  private measureTimelineCards(): void {
    const el = this.timelineSwiper().nativeElement;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.timeline-card'));
    if (!cards.length) {
      return;
    }
    this.timelineCardHeightPx.set(null);
    requestAnimationFrame(() => {
      const max = Math.max(...cards.map((card) => card.getBoundingClientRect().height));
      this.timelineCardHeightPx.set(`${max}px`);
    });
  }

  protected openGallery(project: Project): void {
    if (project.gallery?.length) {
      this.galleryOpen.emit(project);
    }
  }
}
