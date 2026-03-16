import { z } from 'zod';

/**
 * Flight detail info schema
 */
const FlightDetailInfoSchema = z.object({
  baggage: z.string(),
  cabinClass: z.string(),
  aircraft: z.string(),
  duration: z.string(),
  stops: z.number(),
  nextDay: z.boolean(),
});

/**
 * Flight schema
 */
const FlightSchema = z
  .object({
    id: z.string(),
    flightNumber: z.string(),
    departure: z.string(),
    arrival: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    price: z.number(),
    detailInfo: FlightDetailInfoSchema,
  })
  .meta({
    id: 'flight-entity',
    name: 'Flight',
    description: 'Flight schema',
  });

/**
 * Flight search params schema
 */
const FlightSearchParamsSchema = z
  .object({
    departure: z.string().optional(),
    arrival: z.string().optional(),
  })
  .meta({
    id: 'flight-search-params',
    name: 'Flight Search Params',
    description: 'Flight search parameters',
  });

/**
 * Flight type
 */
type Flight = z.infer<typeof FlightSchema>;

/**
 * Flight detail info type
 */
type FlightDetailInfo = z.infer<typeof FlightDetailInfoSchema>;

/**
 * Flight search params type
 */
type FlightSearchParams = z.infer<typeof FlightSearchParamsSchema>;

export {
  FlightSchema,
  FlightDetailInfoSchema,
  FlightSearchParamsSchema,
  Flight,
  FlightDetailInfo,
  FlightSearchParams,
};
