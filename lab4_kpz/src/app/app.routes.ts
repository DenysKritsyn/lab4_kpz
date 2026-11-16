import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role-guard';
import { ForbiddenPage } from './features/auth/forbidden-page/forbidden-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { NotFoundPage } from './features/not-found/not-found-page/not-found-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'diary-entries'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'forbidden',
    component: ForbiddenPage
  },
  {
    path: 'diary-entries',
    loadChildren: () =>
      import('./features/diary-entries/diary-entries.routes').then(
        m => m.DIARY_ENTRIES_ROUTES
      )
  },
  {
    path: 'symptoms',
    canActivate: [roleGuard('doctor', 'admin')],
    loadComponent: () =>
      import('./features/symptoms/symptoms-page/symptoms-page').then(
        m => m.SymptomsPage
      )
  },
  {
    path: 'not-found',
    component: NotFoundPage
  },
  {
    path: '**',
    component: NotFoundPage
  }
];
