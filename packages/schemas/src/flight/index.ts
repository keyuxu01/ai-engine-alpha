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
 * Low price flight search request schema (for MCP tool input)
 */
const LowPriceFlightSearchRequestSchema = z.object({
  departure: z.string().describe('出发城市（如：北京、上海）'),
  arrival: z.string().describe('到达城市（如：北京、上海）'),
  date: z.string().optional().describe('出发日期（YYYY-MM-DD格式）'),
  passengers: z.number().optional().default(1).describe('乘客数量'),
});

/**
 * Low price flight search segment schema (单程/往返航段)
 */
const FlightSegmentSchema = z.object({
  departure: z.string().describe('出发城市'),
  arrival: z.string().describe('到达城市'),
  date: z.string().describe('出发日期（YYYY-MM-DD）'),
});

/**
 * Low price flight search request with segments schema (支持往返)
 */
const LowPriceFlightSearchSegmentsRequestSchema = z.object({
  segments: z
    .array(FlightSegmentSchema)
    .min(1)
    .max(2)
    .describe('航段数组：单元素为单程，两个元素为往返'),
  passengers: z.number().optional().default(1).describe('乘客数量'),
});

/**
 * Flight search result schema
 */
const FlightSearchResultSchema = z.object({
  success: z.boolean(),
  flights: z.array(FlightSchema).default([]),
  totalCount: z.number().default(0),
  message: z.string().optional(),
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

/**
 * Low price flight search request type
 */
type LowPriceFlightSearchRequest = z.infer<typeof LowPriceFlightSearchRequestSchema>;

/**
 * Flight segment type
 */
type FlightSegment = z.infer<typeof FlightSegmentSchema>;

/**
 * Low price flight search with segments type
 */
type LowPriceFlightSearchSegmentsRequest = z.infer<
  typeof LowPriceFlightSearchSegmentsRequestSchema
>;

/**
 * Flight search result type
 */
type FlightSearchResult = z.infer<typeof FlightSearchResultSchema>;

/**
 * MCP structuredContent 返回的 flight 字段结构
 * 对应 FlightMcpService 返回的 structuredContent.flight
 */
export interface McpFlightResult {
  flights?: Flight[];
  totalCount?: number;
  success?: boolean;
  message?: string;
}

/**
 * MCP structuredContent 结构
 */
export interface McpStructuredContent {
  flight?: McpFlightResult | Flight | null;
  error?: string;
}

/**
 * 低价机票搜索结果类型（用于 MCP structuredContent）
 */
type LowPriceFlightSearchResult = McpFlightResult;

/**
 * 低价机票多航段搜索结果类型（用于 MCP structuredContent）
 */
type LowPriceFlightSearchSegmentsResult = McpFlightResult;

// 类型导出（type-only）
export type {
  Flight,
  FlightDetailInfo,
  FlightSearchParams,
  FlightSegment,
  LowPriceFlightSearchRequest,
  LowPriceFlightSearchSegmentsRequest,
  FlightSearchResult,
  LowPriceFlightSearchResult,
  LowPriceFlightSearchSegmentsResult,
};

// McpFlightResult 和 McpStructuredContent 使用 export interface 导出

// Schema 导出（值）
export {
  FlightSchema,
  FlightDetailInfoSchema,
  FlightSearchParamsSchema,
  FlightSegmentSchema,
  LowPriceFlightSearchRequestSchema,
  LowPriceFlightSearchSegmentsRequestSchema,
  FlightSearchResultSchema,
};
