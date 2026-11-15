import { Routes } from '@angular/router';
import { ForbiddenPage } from './features/auth/forbidden-page/forbidden-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { NotFoundPage } from './features/not-found/not-found-page/not-found-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
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
    path: '**',
    component: NotFoundPage
  }
];
