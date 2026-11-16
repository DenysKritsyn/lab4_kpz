import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateSymptomRequest,
  PagedResult,
  Symptom,
  UpdateSymptomRequest
} from './symptom.model';

@Injectable({
  providedIn: 'root'
})
export class SymptomApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/symptoms`;

  getAll(search = '', page = 1, pageSize = 100): Observable<Symptom[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sortBy', 'name')
      .set('sortDirection', 'asc');

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<PagedResult<Symptom>>(this.url, { params })
      .pipe(map(result => result.items));
  }

  getById(id: number): Observable<Symptom> {
    return this.http.get<Symptom>(`${this.url}/${id}`);
  }

  create(data: CreateSymptomRequest): Observable<Symptom> {
    return this.http.post<Symptom>(this.url, data);
  }

  update(id: number, data: UpdateSymptomRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

