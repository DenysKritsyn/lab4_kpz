import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DiaryEntryFormPage } from './diary-entry-form-page';

describe('DiaryEntryFormPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaryEntryFormPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should mark form invalid when entryNote is empty or too short', () => {
    const fixture = TestBed.createComponent(DiaryEntryFormPage);
    const component = fixture.componentInstance;

    component.entryForm.controls.entryNote.setValue('');
    expect(component.entryForm.invalid).toBe(true);

    component.entryForm.controls.entryNote.setValue('ab');
    expect(component.entryForm.controls.entryNote.hasError('minlength')).toBe(true);
    expect(component.entryForm.invalid).toBe(true);
  });

  it('should mark form valid when required fields meet validation rules', () => {
    const fixture = TestBed.createComponent(DiaryEntryFormPage);
    const component = fixture.componentInstance;

    component.entryForm.controls.entryDate.setValue('2026-11-15');
    component.entryForm.controls.entryNote.setValue('Feeling much better after rest.');

    expect(component.entryForm.valid).toBe(true);
  });
});

