import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'en' | 'ru';

export const LANGS: readonly Lang[] = ['en', 'ru'];

const STORAGE_KEY = 'portfolio-lang';

const EN = {
  nav: { home: 'HOME', about: 'ABOUT', animation: 'ANIMATION', contact: 'CONTACT' },
  hero: {
    profession: '3D DESIGNER & 3D ANIMATOR',
    intro:
      'I am a 3D designer and artist specializing in 3D modeling, visualization, animation, and digital project development.',
  },
  skillsTitle: 'SKILLS & TOOLKIT',
  skills: {
    max3ds: '3DS MAX + CORONA',
    blender: 'BLENDER',
    photoshop: 'PHOTOSHOP',
    archicad: 'ARCHICAD',
    audition: 'AUDITION',
    premiere: 'PREMIERE PRO',
    aftereffects: 'AFTER EFFECTS',
  },
  aboutTitle: 'ABOUT ME',
  aboutDescription:
    "My name is Ruslan Guseynov — I'm a 3D designer and artist specializing in 3D modeling, visualization, animation, and digital project development.",
  timeline: [
    { year: '2016', text: 'Started teaching myself Blender — the beginning of my path in 3D.' },
    {
      year: '2020',
      text: 'Interest in modeling grew into a passion for 3D animation: I began creating my own animated scenes and short films.',
    },
    {
      year: '2022',
      text: 'My first full-length short animated film was screened on the big screen at the All-Russian Suzdal Animation Festival.',
    },
    {
      year: '2023',
      text: 'Graduated from VlSU with a degree in Design and joined Komfortis as an interior designer. Mastered 3ds Max, Corona Renderer and Archicad.',
    },
    {
      year: '2025',
      text: 'Moved to freelance: delivered projects for apartments, country houses and a chain of popular venues across several cities.',
    },
    {
      year: '2026',
      text: 'Working on my own game project — responsible for 3D modeling, animation, sound design, writing and the overall visual style. Today, 3D is how I bring my ideas to life.',
    },
  ],
  projectsTitle: 'SELECTED PROJECTS',
  projectsLead:
    'Interiors for homes and public spaces — carried from the first concept through to a finished visualization album.',
  category: 'INTERIOR VISUALIZATION',
  projects: {
    mishka: 'Lounge bar interior concept for Kovrov, delivered as a full visualization album.',
    library:
      'Reading lounge interior with layered timber screens, warm seating and a double-height wall.',
    villageHouse: 'Country house interiors: kitchen-dining room, main bedroom and guest bedrooms.',
    familyHouse: 'Family home interiors: kitchen-dining area, living room and kids rooms.',
  },
  animationTitle: 'ANIMATION',
  animationCopy:
    'Alongside interior work I make my own animation: characters, staging and short films carried from storyboard through to the final cut.\nIn 2022 my first full-length animated short was screened in cinema as part of the All-Russian Suzdal Animation Festival.',
  animation: { openGallery: 'VIEW WORKS', play: 'Play the reel' },
  carousel: { prev: 'Previous projects', next: 'Next projects' },
  gallery: { close: 'Close gallery' },
  player: {
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
  },
  footer: {
    title: 'GET IN TOUCH',
    availability:
      'I enjoy going beyond the brief — proposing ideas and finding a strong visual solution rather than just executing the task. Available for full-time work as well as individual projects and freelance.',
    contactsTitle: 'CONTACTS',
    emailLabel: 'EMAIL',
    telegramLabel: 'TELEGRAM',
    locationLabel: 'LOCATION',
    location: 'Moscow',
    rights: 'ALL RIGHTS RESERVED',
  },
};

type Dictionary = typeof EN;

const RU: Dictionary = {
  nav: { home: 'ГЛАВНАЯ', about: 'ОБО МНЕ', animation: 'АНИМАЦИЯ', contact: 'КОНТАКТЫ' },
  hero: {
    profession: '3D ДИЗАЙНЕР & 3D АНИМАТОР',
    intro:
      'Я 3D-дизайнер и художник, специализирующийся на создании 3D-моделей, визуализации, анимации и разработке цифровых проектов.',
  },
  skillsTitle: 'НАВЫКИ И ИНСТРУМЕНТЫ',
  skills: {
    max3ds: '3DS MAX + CORONA',
    blender: 'BLENDER',
    photoshop: 'PHOTOSHOP',
    archicad: 'ARCHICAD',
    audition: 'AUDITION',
    premiere: 'PREMIERE PRO',
    aftereffects: 'AFTER EFFECTS',
  },
  aboutTitle: 'ОБО МНЕ',
  aboutDescription:
    'Меня зовут Гусейнов Руслан, я 3D-дизайнер и художник, специализирующийся на создании 3D-моделей, визуализации, анимации и разработке цифровых проектов.',
  timeline: [
    { year: '2016', text: 'Начал самостоятельно изучать Blender — так начался мой путь в 3D.' },
    {
      year: '2020',
      text: 'Интерес к моделированию перерос в увлечение 3D-анимацией: начал создавать собственные анимационные сцены и короткие мультфильмы.',
    },
    {
      year: '2022',
      text: 'Первый полноценный короткометражный анимационный фильм показан на большом экране в рамках Всероссийского Суздальского фестиваля анимации.',
    },
    {
      year: '2023',
      text: 'Окончил ВлГУ по специальности «Дизайн» и устроился в «Комфортис» дизайнером интерьеров. Освоил 3ds Max, Corona Renderer и Archicad.',
    },
    {
      year: '2025',
      text: 'Ушёл во фриланс: реализовал проекты для квартир, загородных домов и сети популярных заведений в разных городах.',
    },
    {
      year: '2026',
      text: 'Работаю над собственным игровым проектом — отвечаю за 3D-моделирование, анимацию, саунд-дизайн, сценарий и визуальный стиль. Сегодня 3D для меня — это возможность воплощать свои идеи в жизнь.',
    },
  ],
  projectsTitle: 'ИЗБРАННЫЕ ПРОЕКТЫ',
  projectsLead:
    'Интерьеры частных и общественных пространств — от первой концепции до готового альбома визуализаций.',
  category: 'ВИЗУАЛИЗАЦИЯ ИНТЕРЬЕРА',
  projects: {
    mishka: 'Концепция интерьера лаундж-бара в Коврове, оформлена альбомом визуализаций.',
    library: 'Интерьер читального зала с деревянными рейками, мягкой мебелью и двусветной стеной.',
    villageHouse: 'Интерьеры загородного дома: кухня-столовая, спальня хозяев и гостевые комнаты.',
    familyHouse: 'Интерьеры семейного дома: кухня-столовая, гостиная и детские комнаты.',
  },
  animationTitle: 'АНИМАЦИЯ',
  animationCopy:
    'Помимо интерьеров занимаюсь авторской анимацией: придумываю персонажей, ставлю сцены и собираю короткометражные мультфильмы — от раскадровки до финального монтажа.\nВ 2022 году мой первый полноценный короткометражный анимационный фильм был представлен на большом экране в рамках Всероссийского Суздальского фестиваля анимации.',
  animation: { openGallery: 'СМОТРЕТЬ РАБОТЫ', play: 'Запустить ролик' },
  carousel: { prev: 'Предыдущие проекты', next: 'Следующие проекты' },
  gallery: { close: 'Закрыть галерею' },
  player: {
    play: 'Воспроизвести',
    pause: 'Пауза',
    mute: 'Выключить звук',
    unmute: 'Включить звук',
    fullscreen: 'На весь экран',
    exitFullscreen: 'Выйти из полноэкранного режима',
  },
  footer: {
    title: 'СВЯЖИТЕСЬ СО МНОЙ',
    availability:
      'Интересно не просто выполнять задачу, а предлагать идеи и искать яркие визуальные решения. Готов работать в команде на полной занятости, а также над отдельными проектами и фрилансом.',
    contactsTitle: 'КОНТАКТЫ',
    emailLabel: 'ПОЧТА',
    telegramLabel: 'ТЕЛЕГРАМ',
    locationLabel: 'ЛОКАЦИЯ',
    location: 'Москва',
    rights: 'ВСЕ ПРАВА ЗАЩИЩЕНЫ',
  },
};

const DICTIONARIES: Record<Lang, Dictionary> = { en: EN, ru: RU };

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

@Injectable({ providedIn: 'root' })
export class Translation {
  readonly lang = signal<Lang>(readStoredLang());
  readonly t = computed(() => DICTIONARIES[this.lang()]);

  setLang(lang: Lang): void {
    this.lang.set(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private mode or blocked storage: the choice just will not persist.
    }
  }
}

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) {
      return stored;
    }
  } catch {
    // Ignore and fall through to the default.
  }
  return 'en';
}
