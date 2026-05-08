import { z } from 'zod';
import dayjs from 'dayjs';

const dateSchema = z.string().or(z.date()).transform((val) => {
  const date = dayjs(val);
  if (!date.isValid()) {
    throw new Error('Date invalide');
  }
  return date.toDate();
});

export const createEventSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  startDate: dateSchema,
  
  endDate: dateSchema,
  
  location: z.string()
    .max(500, 'Le lieu ne peut pas dépasser 500 caractères')
    .optional()
}).refine((data) => {
  const start = dayjs(data.startDate);
  const end = dayjs(data.endDate);
  return end.isAfter(start);
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

export const updateEventSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .optional(),
  
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  startDate: dateSchema.optional(),
  
  endDate: dateSchema.optional(),
  
  location: z.string()
    .max(500, 'Le lieu ne peut pas dépasser 500 caractères')
    .optional()
});

export const eventQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().positive().max(100)),
  search: z.string().optional(),
  status: z.enum(['upcoming', 'past', 'all']).optional().default('all'),
  sortBy: z.enum(['startDate', 'title', 'createdAt']).optional().default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryParams = z.infer<typeof eventQuerySchema>;