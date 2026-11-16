import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../symptoms/symptom.model';
import {
  CreateDiaryEntryRequest,
  DiaryEntryDetail,
  DiaryEntryQuery,
  DiaryEntrySummary,
  UpdateDiaryEntryRequest
} from './diary-entry.model';

@Injectable({
  providedIn: 'root'
})
export class DiaryEntryApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/diary-entries`;

  getAll(query: DiaryEntryQuery = {}): Observable<PagedResult<DiaryEntrySummary>> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('pageSize', query.pageSize ?? 50)
      .set('sortBy', query.sortBy ?? 'date')
      .set('sortDirection', query.sortDirection ?? 'desc');

    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }
    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }
    if (query.symptomId) {
      params = params.set('symptomId', query.symptomId);
    }
    if (query.searchNote?.trim()) {
      params = params.set('searchNote', query.searchNote.trim());
    }

    return this.http.get<PagedResult<DiaryEntrySummary>>(this.url, { params });
  }

  getById(id: number): Observable<DiaryEntryDetail> {
    return this.http.get<DiaryEntryDetail>(`${this.url}/${id}`);
  }

  create(data: CreateDiaryEntryRequest): Observable<DiaryEntryDetail> {
    return this.http.post<DiaryEntryDetail>(this.url, data);
  }

  update(id: number, data: UpdateDiaryEntryRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

