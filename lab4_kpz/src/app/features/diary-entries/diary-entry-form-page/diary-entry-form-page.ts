import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ConditionLabelPipe } from '../../../shared/condition-label-pipe';
import { SymptomApiService } from '../../symptoms/symptom-api-service';
import { DiaryEntryApiService } from '../diary-entry-api-service';
import { CreateDayIntervalRequest, DiaryEntryDetail } from '../diary-entry.model';

type IntervalFormGroup = FormGroup<{
  intervalStartTime: FormControl<string>;
  intervalEndTime: FormControl<string>;
  conditionStateId: FormControl<number>;
  intervalNote: FormControl<string>;
  symptomId: FormControl<number>;
  severityLevelId: FormControl<number>;
  symptomNote: FormControl<string>;
}>;

@Component({
  selector: 'app-diary-entry-form-page',
  imports: [ReactiveFormsModule, RouterLink, ConditionLabelPipe],
  templateUrl: './diary-entry-form-page.html',
  styleUrl: './diary-entry-form-page.css'
})
export class DiaryEntryFormPage {
  private readonly api = inject(DiaryEntryApiService);
  private readonly symptomApi = inject(SymptomApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly entryId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = Boolean(this.entryId);

  readonly loadingEntry = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly conditionStates = [1, 2, 3, 4, 5];
  readonly severityLevels = [
    { id: 1, label: '1 - Mild' },
    { id: 2, label: '2 - Moderate' },
    { id: 3, label: '3 - Severe' }
  ];

  readonly symptoms = toSignal(
    this.symptomApi.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly entryForm = this.fb.group({
    entryDate: [this.todayIsoDate(), [Validators.required]],
    entryNote: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]
    ],
    intervals: this.fb.array<IntervalFormGroup>([])
  });

  constructor() {
    if (this.entryId) {
      this.loadExistingEntry(Number(this.entryId));
    } else {
      this.addInterval();
    }
  }

  get intervals(): FormArray<IntervalFormGroup> {
    return this.entryForm.controls.intervals;
  }

  addInterval(): void {
    const group: IntervalFormGroup = this.fb.group({
      intervalStartTime: ['08:00:00', [Validators.required]],
      intervalEndTime: ['12:00:00', [Validators.required]],
      conditionStateId: [
        3,
        [Validators.required, Validators.min(1), Validators.max(5)]
      ],
      intervalNote: ['', [Validators.maxLength(500)]],
      symptomId: [1, [Validators.required, Validators.min(1)]],
      severityLevelId: [
        1,
        [Validators.required, Validators.min(1), Validators.max(3)]
      ],
      symptomNote: ['', [Validators.maxLength(250)]]
    });

    this.intervals.push(group);
  }

  removeInterval(index: number): void {
    this.intervals.removeAt(index);
  }

  onSubmit(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const raw = this.entryForm.getRawValue();
    const mappedIntervals: CreateDayIntervalRequest[] = raw.intervals.map(item => ({
      intervalStartTime: this.normalizeTime(item.intervalStartTime),
      intervalEndTime: this.normalizeTime(item.intervalEndTime),
      conditionStateId: Number(item.conditionStateId),
      intervalNote: item.intervalNote.trim() || null,
      symptoms: item.symptomId
        ? [
            {
              symptomId: Number(item.symptomId),
              severityLevelId: Number(item.severityLevelId),
              symptomNote: item.symptomNote.trim() || null
            }
          ]
        : []
    }));

    this.saving.set(true);
    this.errorMessage.set(null);

    if (this.entryId) {
      const id = Number(this.entryId);
      this.api
        .update(id, {
          entryNote: raw.entryNote.trim(),
          dayIntervals: mappedIntervals
        })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/diary-entries', id]),
          error: (error: HttpErrorResponse) => this.showError(error)
        });
    } else {
      this.api
        .create({
          entryDate: raw.entryDate,
          entryNote: raw.entryNote.trim(),
          dayIntervals: mappedIntervals
        })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: created => this.router.navigate(['/diary-entries', created.diaryEntryId]),
          error: (error: HttpErrorResponse) => this.showError(error)
        });
    }
  }

  private loadExistingEntry(id: number): void {
    this.loadingEntry.set(true);
    this.api
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingEntry.set(false))
      )
      .subscribe({
        next: (entry: DiaryEntryDetail) => {
          this.entryForm.patchValue({
            entryDate: entry.entryDate,
            entryNote: entry.entryNote ?? ''
          });

          this.intervals.clear();
          if (entry.dayIntervals.length === 0) {
            this.addInterval();
            return;
          }

          for (const interval of entry.dayIntervals) {
            const firstSymptom = interval.symptoms?.[0];
            this.intervals.push(
              this.fb.group({
                intervalStartTime: [interval.intervalStartTime, [Validators.required]],
                intervalEndTime: [interval.intervalEndTime, [Validators.required]],
                conditionStateId: [
                  interval.conditionStateId,
                  [Validators.required, Validators.min(1), Validators.max(5)]
                ],
                intervalNote: [interval.intervalNote ?? '', [Validators.maxLength(500)]],
                symptomId: [
                  firstSymptom?.symptomId ?? 1,
                  [Validators.required, Validators.min(1)]
                ],
                severityLevelId: [
                  firstSymptom?.severityLevelId ?? 1,
                  [Validators.required, Validators.min(1), Validators.max(3)]
                ],
                symptomNote: [
                  firstSymptom?.symptomNote ?? '',
                  [Validators.maxLength(250)]
                ]
              })
            );
          }
        },
        error: () => {
          this.errorMessage.set('Could not load the diary entry for editing.');
        }
      });
  }

  private showError(error: HttpErrorResponse): void {
    const errors: Record<string, string[]> | undefined = error.error?.errors;

    if ((error.status === 400 || error.status === 422) && errors) {
      for (const [rawField, messages] of Object.entries(errors)) {
        const normalizedField =
          rawField.charAt(0).toLowerCase() + rawField.slice(1);
        const control = this.entryForm.get(normalizedField);
        if (control && messages.length > 0) {
          control.setErrors({ server: messages[0] });
        }
      }
      const firstMessage = Object.values(errors).flat()[0];
      this.errorMessage.set(firstMessage ?? 'Server validation failed.');
      return;
    }

    if (error.status === 409) {
      const detail =
        error.error?.detail ??
        'A diary entry for the selected date already exists for this user.';
      this.entryForm.controls.entryDate.setErrors({ server: detail });
      this.errorMessage.set(detail);
      return;
    }

    this.errorMessage.set(error.error?.detail ?? 'Failed to save diary entry.');
  }

  private normalizeTime(value: string): string {
    if (!value) {
      return '08:00:00';
    }
    return value.length === 5 ? `${value}:00` : value;
  }

  private todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

