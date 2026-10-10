import { Component, signal } from '@angular/core';
import { AboutSection, Project } from './components/about-section/about-section';
import { AnimationSection } from './components/animation-section/animation-section';
import { HeroSection } from './components/hero-section/hero-section';
import { ProjectGallery } from './components/project-gallery/project-gallery';
import { SiteFooter } from './components/site-footer/site-footer';
import { SiteHeader } from './components/site-header/site-header';

@Component({
  imports: [AboutSection, AnimationSection, HeroSection, ProjectGallery, SiteFooter, SiteHeader],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('portfolio');

  protected readonly openedProject = signal<Project | null>(null);

  /** Matches the fixed footer, so the page can scroll far enough to show it. */
  protected readonly footerHeight = signal(0);

  protected openGallery(project: Project): void {
    this.openedProject.set(project);
  }

  protected closeGallery(): void {
    this.openedProject.set(null);
  }
}
