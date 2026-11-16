import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { SearchBox } from '../../../shared/search-box/search-box';
import { SeverityHighlightDirective } from '../../../shared/severity-highlight';
import { SymptomApiService } from '../../symptoms/symptom-api-service';
import { DiaryEntryApiService } from '../diary-entry-api-service';
import { DiaryEntrySummary } from '../diary-entry.model';

@Component({
  selector: 'app-diary-entries-page',
  imports: [RouterLink, FormsModule, SearchBox, SeverityHighlightDirective],
  templateUrl: './diary-entries-page.html',
  styleUrl: './diary-entries-page.css'
})
export class DiaryEntriesPage {
  private readonly api = inject(DiaryEntryApiService);
  private readonly symptomApi = inject(SymptomApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly entries = signal<DiaryEntrySummary[]>([]);
  readonly totalCount = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);

  readonly searchNote = signal('');
  readonly selectedSymptomId = signal<number | null>(null);
  readonly fromDate = signal('');
  readonly toDate = signal('');

  readonly symptoms = toSignal(
    this.symptomApi.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly filteredEntries = computed(() => {
    const query = this.searchNote().trim().toLowerCase();
    if (!query) {
      return this.entries();
    }
    return this.entries().filter(entry =>
      (entry.entryNote ?? '').toLowerCase().includes(query)
    );
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getAll({
        page: 1,
        pageSize: 50,
        symptomId: this.selectedSymptomId(),
        fromDate: this.fromDate() || undefined,
        toDate: this.toDate() || undefined,
        searchNote: this.searchNote() || undefined
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: result => {
          this.entries.set(result.items);
          this.totalCount.set(result.totalCount);
        },
        error: () => {
          this.error.set('Could not load diary entries from the server.');
        }
      });
  }

  onFilterChange(): void {
    this.load();
  }

  resetFilters(): void {
    this.searchNote.set('');
    this.selectedSymptomId.set(null);
    this.fromDate.set('');
    this.toDate.set('');
    this.load();
  }

  deleteEntry(entry: DiaryEntrySummary): void {
    if (!confirm(`Delete the diary entry for ${entry.entryDate}?`)) {
      return;
    }

    this.error.set(null);
    this.actionMessage.set(null);

    this.api.delete(entry.diaryEntryId).subscribe({
      next: () => {
        this.actionMessage.set(`Diary entry for ${entry.entryDate} was deleted.`);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.error.set('You can only delete your own diary entries.');
        } else if (err.status === 404) {
          this.error.set('Diary entry was already removed.');
          this.load();
        } else {
          this.error.set(err.error?.detail ?? 'Failed to delete diary entry.');
        }
      }
    });
  }
}

