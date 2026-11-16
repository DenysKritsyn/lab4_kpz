import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth-guard';
import { DiaryEntriesPage } from './diary-entries-page/diary-entries-page';
import { DiaryEntryDetailsPage } from './diary-entry-details-page/diary-entry-details-page';
import { DiaryEntryFormPage } from './diary-entry-form-page/diary-entry-form-page';
import { diaryEntryResolver } from './diary-entry-resolver';

export const DIARY_ENTRIES_ROUTES: Routes = [
  {
    path: '',
    component: DiaryEntriesPage,
    canActivate: [authGuard]
  },
  {
    path: 'new',
    component: DiaryEntryFormPage,
    canActivate: [authGuard]
  },
  {
    path: ':id',
    component: DiaryEntryDetailsPage,
    canActivate: [authGuard],
    resolve: {
      entry: diaryEntryResolver
    }
  },
  {
    path: ':id/edit',
    component: DiaryEntryFormPage,
    canActivate: [authGuard]
  }
];

