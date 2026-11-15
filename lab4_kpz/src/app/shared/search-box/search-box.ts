import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.html',
  styleUrl: './search-box.css'
})
export class SearchBox {
  readonly value = input('');
  readonly placeholder = input('Search...');
  readonly label = input('Search');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.valueChange.emit(inputEl.value);
  }

  clear(): void {
    this.valueChange.emit('');
  }
}

