import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../symptoms/symptom.model';
import { DiaryEntryApiService } from './diary-entry-api-service';
import { DiaryEntrySummary } from './diary-entry.model';

describe('DiaryEntryApiService', () => {
  let service: DiaryEntryApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(DiaryEntryApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch paginated diary entries via GET', () => {
    const mockResponse: PagedResult<DiaryEntrySummary> = {
      items: [
        {
          diaryEntryId: 1,
          userId: 1,
          entryDate: '2026-11-10',
          entryNote: 'Morning headache after coffee',
          intervalsCount: 1,
          eventsCount: 0,
          measurementsCount: 1,
          entryCreatedAt: '2026-11-10T08:00:00Z',
          entryUpdatedAt: '2026-11-10T08:00:00Z'
        }
      ],
      page: 1,
      pageSize: 50,
      totalCount: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    };

    let actualResult: PagedResult<DiaryEntrySummary> | undefined;
    service.getAll({ symptomId: 2, searchNote: 'headache' }).subscribe(res => {
      actualResult = res;
    });

    const req = httpTesting.expectOne(
      r =>
        r.url === `${environment.apiUrl}/diary-entries` &&
        r.params.get('symptomId') === '2' &&
        r.params.get('searchNote') === 'headache'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(actualResult).toEqual(mockResponse);
  });

  it('should send POST request when creating a diary entry', () => {
    const payload = {
      entryDate: '2026-11-15',
      entryNote: 'Mild fatigue in the afternoon',
      dayIntervals: []
    };

    service.create(payload).subscribe();

    const req = httpTesting.expectOne(`${environment.apiUrl}/diary-entries`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      diaryEntryId: 5,
      userId: 1,
      entryDate: '2026-11-15',
      entryNote: 'Mild fatigue in the afternoon',
      entryCreatedAt: '2026-11-15T12:00:00Z',
      entryUpdatedAt: '2026-11-15T12:00:00Z',
      dayIntervals: [],
      dayEvents: [],
      measurements: []
    });
  });
});

