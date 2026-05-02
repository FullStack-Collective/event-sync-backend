import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { number } from 'zod';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DEFAULT_TIMEZONE = 'Africa/Nairobi';

export const dateUtils = {
	parseDate: (date: string | Date): dayjs.Dayjs => {
    const parsed = dayjs(date);
    if (!parsed.isValid()) {
		throw new Error(`Date invalide: ${date}`);
    }
    return parsed;
    },

    isEndDateAfterStart: (startDate: Date | string, endDate: Date | string): boolean => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.isAfter(start);
    },

    formatDate: (date: Date | string, format = 'DD/MM/YYYY HH:mm'): string => {
    return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
    },

	isLive: (startDate: Date | string, endDate: Date | string): boolean => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return now.isAfter(start) && now.isBefore(end);
    },

	isUpcoming: (startDate: Date | string): boolean => {
		return dayjs(startDate).isAfter(dayjs());
	},

	isPast: (endDate: Date | string): boolean => {
		return dayjs(endDate).isBefore(dayjs());
	},

	getDurationInMinutes: (startDate: Date | string, endDate: Date | string): number => {
		const start = dayjs(startDate);
		const end = dayjs(endDate);
		return end.diff(start, 'minute');
	}
}
