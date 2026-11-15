import { Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'hovered() ? color() : ""',
    '[style.transition]': '"background-color 0.15s ease"',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)'
  }
})
export class SeverityHighlightDirective {
  readonly color = input('#eff6ff', { alias: 'appHighlight' });
  readonly hovered = signal(false);
}

