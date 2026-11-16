import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DiaryEntryApiService } from './diary-entry-api-service';
import { DiaryEntryDetail } from './diary-entry.model';

export const diaryEntryResolver: ResolveFn<DiaryEntryDetail> = route => {
  const api = inject(DiaryEntryApiService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return new RedirectCommand(router.parseUrl('/not-found'));
  }

  return api.getById(id).pipe(
    catchError(() => of(new RedirectCommand(router.parseUrl('/not-found'))))
  );
};

