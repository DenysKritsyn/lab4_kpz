import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConditionLabelPipe } from '../../../shared/condition-label-pipe';
import { SeverityHighlightDirective } from '../../../shared/severity-highlight';
import { DiaryEntryDetail } from '../diary-entry.model';

@Component({
  selector: 'app-diary-entry-details-page',
  imports: [RouterLink, ConditionLabelPipe, SeverityHighlightDirective],
  templateUrl: './diary-entry-details-page.html',
  styleUrl: './diary-entry-details-page.css'
})
export class DiaryEntryDetailsPage {
  private readonly route = inject(ActivatedRoute);

  readonly entry = toSignal(
    this.route.data.pipe(map(data => data['entry'] as DiaryEntryDetail))
  );

  readonly totalSymptomsRecorded = computed(() => {
    const current = this.entry();
    if (!current) {
      return 0;
    }
    return current.dayIntervals.reduce(
      (sum, interval) => sum + (interval.symptoms?.length ?? 0),
      0
    );
  });
}

