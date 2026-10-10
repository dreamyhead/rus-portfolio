import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translation } from '../../i18n/translation';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly t = inject(Translation).t;
}
