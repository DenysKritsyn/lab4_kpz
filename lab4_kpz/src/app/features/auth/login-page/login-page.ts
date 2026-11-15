import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth-service';

interface QuickAccount {
  label: string;
  username: string;
  password: string;
  roleDescription: string;
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    username: ['patient1', [Validators.required]],
    password: ['patient123', [Validators.required]]
  });

  readonly quickAccounts: QuickAccount[] = [
    {
      label: 'Patient 1 (Alex Smith)',
      username: 'patient1',
      password: 'patient123',
      roleDescription: 'patient'
    },
    {
      label: 'Patient 2 (Olena Koval)',
      username: 'patient2',
      password: 'patient123',
      roleDescription: 'patient'
    },
    {
      label: 'Doctor 1 (Dmytro Shevchenko)',
      username: 'doctor1',
      password: 'doctor123',
      roleDescription: 'doctor'
    },
    {
      label: 'Admin 1 (System Admin)',
      username: 'admin1',
      password: 'admin123',
      roleDescription: 'admin'
    }
  ];

  selectQuickAccount(account: QuickAccount): void {
    this.loginForm.setValue({
      username: account.username,
      password: account.password
    });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .loginWithPassword(username, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 400) {
            this.errorMessage.set('Invalid username or password.');
          } else {
            this.errorMessage.set(
              'Could not reach Keycloak authentication server. Make sure Keycloak is running on port 8080.'
            );
          }
        }
      });
  }
}

