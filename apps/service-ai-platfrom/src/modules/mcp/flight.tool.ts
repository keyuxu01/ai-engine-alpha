import { Injectable, Logger } from '@nestjs/common';
import { Tool, Resource } from '@rekog/mcp-nest';
import { z } from 'zod';

import { FlightService } from '../flight/flight.service';
import {
  LowPriceFlightSearchRequestSchema,
  LowPriceFlightSearchSegmentsRequestSchema,
  type FlightSearchResult,
  type LowPriceFlightSearchRequest,
  type LowPriceFlightSearchSegmentsRequest,
} from '@repo/schemas';

/**
 * MCP Tool Provider for Flight-related operations.
 *
 * This class implements MCP Tools and Resources following the @rekog/mcp-nest patterns.
 * Each public method decorated with @Tool() or @Resource() is automatically discovered
 * and registered with the MCP server during NestJS bootstrap (via McpRegistryDiscoveryService).
 *
 * Architecture:
 *  - Tools (@Tool): Executable functions the LLM can call — e.g., search flights, get details.
 *  - Resources (@Resource): Read-only data the LLM can read — static text explaining usage.
 *
 * Tool method signature (per MCP-Nest docs):
 *   1st param:  { ...args }       — Zod-validated input parameters from the @Tool() schema
 *   2nd param:  context: Context  — MCP execution context (progress reporting, elicitation, etc.)
 *   3rd param:  request: Request  — Raw HTTP request (headers, auth, etc.) — undefined in STDIO
 *
 * Dependencies:
 *  - FlightService is injected for all business logic (mock data in dev).
 *  - Supports NestJS dependency injection; use scope: Scope.REQUEST for request-scoped services.
 *
 * @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/tools.md
 * @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/resources.md
 */
@Injectable()
export class FlightTool {
  // ─── Resource URI Constants ──────────────────────────────────────────────────
  private static readonly FLIGHT_CARD_URI =
    'resource://ai-engine/flight-search-card';

  private readonly logger = new Logger(FlightTool.name);

  constructor(private readonly flightService: FlightService) {}

  // ─── Tool Metadata ───────────────────────────────────────────────────────────
  private static readonly TOOL_META = {
    ui: { resourceUri: FlightTool.FLIGHT_CARD_URI },
    'openai/outputTemplate': FlightTool.FLIGHT_CARD_URI,
  };

  // ─── Resources ───────────────────────────────────────────────────────────────
  // Resources are read-only data sources. MCP clients discover them via `resources/list`
  // and read them via `resources/read`. Unlike tools, they do NOT perform side effects.
  // Return format: { contents: [{ uri, mimeType, text }] } per MCP spec.
  //
  // @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/resources.md
  // @see https://modelcontextprotocol.io/specification/2025-06-18/server/resources

  /**
   * A simple HTML flight search card — a plain UI snippet for quick rendering.
   */
  @Resource({
    name: 'flight_search_card',
    description: '航班搜索卡片 HTML — simple HTML flight search card',
    mimeType: 'text/html',
    uri: 'resource://ai-engine/flight-search-card',
  })
  getFlightSearchCard({ uri }: { uri: string }) {
    const html = `<div style="font-family:sans-serif;border:1px solid #e5e7eb;border-radius:8px;padding:16px;max-width:320px">
  <div style="font-weight:700;font-size:14px;margin-bottom:12px">航班搜索</div>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;gap:8px">
      <div style="flex:1;background:#f9fafb;border-radius:6px;padding:8px;text-align:center;font-size:12px">出发地</div>
      <div style="width:24px;display:flex;align-items:center;justify-content:center;color:#9ca3af">→</div>
      <div style="flex:1;background:#f9fafb;border-radius:6px;padding:8px;text-align:center;font-size:12px">目的地</div>
    </div>
    <div style="background:#f3f4f6;border-radius:6px;padding:8px;text-align:center;font-size:12px;color:#6b7280">日期选择</div>
    <button style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:8px;font-size:13px;cursor:pointer">搜索航班</button>
  </div>
</div>`;

    return {
      contents: [
        {
          uri,
          mimeType: 'text/html',
          text: html,
        },
      ],
    };
  }

  // ─── Tools ───────────────────────────────────────────────────────────────────
  // Tools are executable functions. MCP clients discover them via `tools/list`
  // and invoke them via `tools/call`. Tools CAN perform side effects (API calls, DB writes).
  // Return format: { content: [{ type: 'text', text: string }], structuredContent?: object }
  // @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/tools.md
  // @see https://modelcontextprotocol.io/specification/2025-06-18/server/tools

  /**
   * Search for low-price one-way flights between two cities.
   *
   * @param params.departure  - Origin city name (e.g., "北京")
   * @param params.arrival    - Destination city name (e.g., "上海")
   * @param params.date       - Departure date (YYYY-MM-DD). Optional.
   * @param params.passengers - Number of passengers. Defaults to 1.
   *
   * @returns A human-readable summary + structured data (flights array, totalCount).
   *          Errors return isError: true with an error message.
   */
  @Tool({
    name: 'search_low_price_flights',
    description:
      '搜索低价机票（单程）。输入出发城市和到达城市即可查询可用航班。' +
      'Returns a summary list of matching flights with prices.',
    parameters: LowPriceFlightSearchRequestSchema,
    _meta: FlightTool.TOOL_META,
  })
  async searchLowPriceFlights(params: LowPriceFlightSearchRequest) {
    this.logger.log(
      `[FlightTool] search_low_price_flights called: ${JSON.stringify(params)}`,
    );

    const requestParams: LowPriceFlightSearchRequest = {
      departure: params.departure,
      arrival: params.arrival,
      date: params.date,
      passengers: params.passengers ?? 1,
    };

    const result =
      await this.flightService.searchLowPriceFlights(requestParams);
    return this.buildFlightSearchResponse(result);
  }

  /**
   * Search for low-price flights using a segments array.
   * - Single element = one-way trip
   * - Two elements   = round trip
   *
   * @param params.segments   - Array of flight segments (city pairs + optional dates)
   * @param params.passengers - Number of passengers. Defaults to 1.
   *
   * @see searchLowPriceFlights for single-leg search.
   */
  @Tool({
    name: 'search_low_price_flights_with_segments',
    description:
      '搜索低价机票（支持往返）。使用 segments 数组：单元素为单程，两个元素为往返。' +
      'Searches low-price flights using an array of segments. Single element = one-way; two elements = round trip.',
    parameters: LowPriceFlightSearchSegmentsRequestSchema,
    _meta: FlightTool.TOOL_META,
  })
  async searchLowPriceFlightsWithSegments(
    params: LowPriceFlightSearchSegmentsRequest,
  ) {
    this.logger.log(
      `[FlightTool] search_low_price_flights_with_segments called: ${JSON.stringify(params)}`,
    );

    const result = await this.flightService.searchLowPriceFlightsWithSegments({
      segments: params.segments,
      passengers: params.passengers ?? 1,
    });

    return this.buildFlightSearchResponse(result);
  }

  /**
   * Get detailed information for a specific flight by its ID.
   *
   * @param params.id - The unique flight identifier (e.g., "CA1234-2026-03-27")
   *
   * @returns Human-readable flight detail + structured data.
   *          Returns isError: true if the flight is not found.
   */
  @Tool({
    name: 'get_flight_detail',
    description:
      '获取指定航班的详细信息（航班号、航线、时间、价格等）。' +
      'Returns detailed flight info including number, route, times, and price.',
    parameters: z.object({
      id: z.string().describe('航班ID — unique flight identifier'),
    }),
    _meta: FlightTool.TOOL_META,
  })
  async getFlightDetail(params: { id: string }) {
    this.logger.log(`[FlightTool] get_flight_detail called: id=${params.id}`);

    const flight = await this.flightService.getFlightById(params.id);

    if (!flight) {
      // Per MCP spec: isError: true signals a tool execution error to the client.
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `未找到航班: ${params.id}`,
          },
        ],
        structuredContent: {
          flight: null,
          error: `未找到航班: ${params.id}`,
        },
        _meta: FlightTool.TOOL_META,
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: this.formatFlightDetailText(flight),
        },
      ],
      structuredContent: {
        flight,
      },
      _meta: FlightTool.TOOL_META,
    };
  }

  // ─── Response Builders ──────────────────────────────────────────────────────
  // All tool responses follow a consistent format:
  //   - content[0].text  : Human-readable summary for the LLM
  //   - structuredContent: Machine-readable data (JSON object) for programmatic use
  //   - _meta            : UI integration hints (which resource URI to link)
  //
  // This dual-format pattern (text + structuredContent) is recommended by MCP-Nest
  // to support both LLM consumption and client UI rendering.

  /**
   * Build a standardized flight search response.
   * Returns up to 5 flights as a readable summary, plus the full list in structuredContent.
   */
  private buildFlightSearchResponse(result: FlightSearchResult) {
    return {
      content: [
        {
          type: 'text' as const,
          text: this.formatFlightResultsText(result),
        },
      ],
      structuredContent: {
        flight: {
          flights: result.flights,
          totalCount: result.totalCount,
          success: result.success,
          message: result.message,
        },
      },
      _meta: FlightTool.TOOL_META,
    };
  }

  /**
   * Format search results as a human-readable string.
   * Shows up to 5 flights; truncates with "...还有 N 个航班" if more exist.
   */
  private formatFlightResultsText(result: FlightSearchResult): string {
    if (!result?.success) {
      return result?.message || '未找到航班';
    }

    const flights = result.flights ?? [];
    const count = result.totalCount ?? flights.length;

    if (flights.length === 0) {
      return `找到 ${count} 个航班`;
    }

    const lines = flights.slice(0, 5).map((f, index) => {
      return `${index + 1}. ${f.flightNumber ?? '-'} | ${f.departure ?? '-'} → ${f.arrival ?? '-'} | ${f.departureTime ?? '-'} - ${f.arrivalTime ?? '-'} | ¥${f.price ?? '-'}`;
    });

    return [
      `找到 ${count} 个航班：`,
      ...lines,
      count > 5 ? `...还有 ${count - 5} 个航班` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Format a single flight detail as a human-readable string.
   */
  private formatFlightDetailText(flight: {
    flightNumber?: string;
    departure?: string;
    arrival?: string;
    departureTime?: string;
    arrivalTime?: string;
    price?: number | string;
  }): string {
    return [
      `航班号: ${flight.flightNumber ?? '-'}`,
      `航线: ${flight.departure ?? '-'} → ${flight.arrival ?? '-'}`,
      `时间: ${flight.departureTime ?? '-'} - ${flight.arrivalTime ?? '-'}`,
      `价格: ¥${flight.price ?? '-'}`,
    ].join('\n');
  }
}
