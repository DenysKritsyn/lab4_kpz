export interface IntervalSymptomItem {
  dayIntervalId: number;
  symptomId: number;
  symptomName?: string | null;
  severityLevelId: number;
  severityName?: string | null;
  symptomNote?: string | null;
}

export interface CreateIntervalSymptomRequest {
  symptomId: number;
  severityLevelId: number;
  symptomNote?: string | null;
}

export interface DayIntervalItem {
  dayIntervalId: number;
  diaryEntryId: number;
  intervalStartTime: string;
  intervalEndTime: string;
  conditionStateId: number;
  conditionStateName?: string | null;
  intervalNote?: string | null;
  symptoms: IntervalSymptomItem[];
}

export interface CreateDayIntervalRequest {
  intervalStartTime: string;
  intervalEndTime: string;
  conditionStateId: number;
  intervalNote?: string | null;
  symptoms?: CreateIntervalSymptomRequest[];
}

export interface DayEventItem {
  dayEventId: number;
  diaryEntryId: number;
  eventTypeId: number;
  eventTypeName?: string | null;
  eventStartTime: string;
  eventEndTime: string;
  isPreciseTime: boolean;
  eventNote?: string | null;
}

export interface MetricItem {
  metricId: number;
  measurementId: number;
  metricUnitId: number;
  metricName: string;
  metricValue: number;
  unitName?: string | null;
}

export interface MeasurementItem {
  measurementId: number;
  diaryEntryId: number;
  measuringTime: string;
  metrics: MetricItem[];
}

export interface DiaryEntrySummary {
  diaryEntryId: number;
  userId: number;
  entryDate: string;
  entryNote?: string | null;
  intervalsCount: number;
  eventsCount: number;
  measurementsCount: number;
  entryCreatedAt: string;
  entryUpdatedAt: string;
}

export interface DiaryEntryDetail {
  diaryEntryId: number;
  userId: number;
  entryDate: string;
  entryNote?: string | null;
  entryCreatedAt: string;
  entryUpdatedAt: string;
  dayIntervals: DayIntervalItem[];
  dayEvents: DayEventItem[];
  measurements: MeasurementItem[];
}

export interface CreateDiaryEntryRequest {
  entryDate: string;
  entryNote?: string | null;
  dayIntervals?: CreateDayIntervalRequest[];
}

export interface UpdateDiaryEntryRequest {
  entryNote?: string | null;
  dayIntervals?: CreateDayIntervalRequest[];
}

export interface DiaryEntryQuery {
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  symptomId?: number | null;
  searchNote?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

