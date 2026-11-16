export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Symptom {
  symptomId: number;
  symptomName: string;
}

export interface CreateSymptomRequest {
  symptomName: string;
}

export interface UpdateSymptomRequest {
  symptomName: string;
}

