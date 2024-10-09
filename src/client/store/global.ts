import { Dayjs } from 'dayjs';
import { create } from 'zustand';

export enum DateRange {
  Realtime,
  Last24Hours,
  Today,
  Yesterday,
  ThisWeek,
  Last7Days,
  ThisMonth,
  Last30Days,
  Last90Days,
  ThisYear,
  Custom,
}

interface GlobalState {
  dateRange: DateRange;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  showPreviousPeriod: boolean;
}

export const useGlobalStateStore = create<GlobalState>(() => ({
  dateRange: DateRange.Last24Hours,
  startDate: null,
  endDate: null,
  showPreviousPeriod: false,
}));
