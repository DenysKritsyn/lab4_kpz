import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth-service';
import { SearchBox } from '../../../shared/search-box/search-box';
import { SeverityHighlightDirective } from '../../../shared/severity-highlight';
import { SymptomApiService } from '../symptom-api-service';
import { Symptom } from '../symptom.model';

@Component({
  selector: 'app-symptoms-page',
  imports: [ReactiveFormsModule, SearchBox, SeverityHighlightDirective],
  templateUrl: './symptoms-page.html',
  styleUrl: './symptoms-page.css'
})
export class SymptomsPage {
  private readonly api = inject(SymptomApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly authService = inject(AuthService);

  readonly symptoms = signal<Symptom[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly editingSymptomId = signal<number | null>(null);

  readonly filteredSymptoms = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return this.symptoms();
    }
    return this.symptoms().filter(s => s.symptomName.toLowerCase().includes(q));
  });

  readonly symptomForm = this.fb.group({
    symptomName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
    ]
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: items => this.symptoms.set(items),
        error: () => this.error.set('Failed to load the symptoms catalog from the server.')
      });
  }

  startEdit(symptom: Symptom): void {
    this.editingSymptomId.set(symptom.symptomId);
    this.symptomForm.setValue({ symptomName: symptom.symptomName });
    this.actionMessage.set(null);
    this.error.set(null);
  }

  cancelEdit(): void {
    this.editingSymptomId.set(null);
    this.symptomForm.reset({ symptomName: '' });
  }

  onSubmit(): void {
    if (this.symptomForm.invalid) {
      this.symptomForm.markAllAsTouched();
      return;
    }

    const payload = this.symptomForm.getRawValue();
    const editingId = this.editingSymptomId();

    this.saving.set(true);
    this.error.set(null);
    this.actionMessage.set(null);

    const request$: Observable<unknown> = editingId
      ? this.api.update(editingId, payload)
      : this.api.create(payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.actionMessage.set(
          editingId ? 'Symptom updated successfully.' : 'New symptom added to the catalog.'
        );
        this.cancelEdit();
        this.load();
      },
      error: (err: HttpErrorResponse) => this.handleFormError(err)
    });
  }

  deleteSymptom(symptom: Symptom): void {
    if (!confirm(`Delete symptom "${symptom.symptomName}" from the catalog?`)) {
      return;
    }

    this.error.set(null);
    this.actionMessage.set(null);

    this.api.delete(symptom.symptomId).subscribe({
      next: () => {
        this.actionMessage.set(`Symptom "${symptom.symptomName}" deleted.`);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.error.set(
            err.error?.detail ??
              'Cannot delete this symptom because it is referenced in patient diary entries.'
          );
        } else if (err.status === 403) {
          this.error.set('Only an Administrator is permitted to delete symptoms from the catalog.');
        } else {
          this.error.set('Failed to delete symptom.');
        }
      }
    });
  }

  private handleFormError(err: HttpErrorResponse): void {
    const errors: Record<string, string[]> | undefined = err.error?.errors;
    if (err.status === 400 && errors) {
      const msg = errors['SymptomName']?.[0] ?? errors['symptomName']?.[0];
      if (msg) {
        this.symptomForm.controls.symptomName.setErrors({ server: msg });
        return;
      }
    }

    if (err.status === 409) {
      this.symptomForm.controls.symptomName.setErrors({
        server: err.error?.detail ?? 'A symptom with this name already exists.'
      });
      return;
    }

    this.error.set(err.error?.detail ?? 'Failed to save symptom.');
  }
}

