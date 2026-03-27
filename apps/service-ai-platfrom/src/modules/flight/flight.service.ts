import { Injectable, Logger } from '@nestjs/common';

import type {
  LowPriceFlightSearchRequest,
  LowPriceFlightSearchSegmentsRequest,
  FlightSearchResult,
  Flight,
} from '@repo/schemas';

/**
 * FlightService — Core business logic for flight operations.
 *
 * This service is intentionally decoupled from MCP. It handles all flight-related
 * business logic: searching, querying, pricing, etc.
 *
 * Design principles:
 *  1. No MCP dependencies — no @Tool, @Resource, or MCP SDK imports.
 *  2. Returns plain data objects (FlightSearchResult, Flight, null).
 *  3. No HTTP request context — call this from Controllers, Tools, background jobs, etc.
 *  4. TODO: Replace mock data with real database queries or external API calls.
 *
 * @see FlightTool for the MCP layer that wraps this service.
 */
@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);

  /**
   * Search for low-price one-way flights between two cities.
   *
   * @param params.departure  - Origin city name (e.g., "北京")
   * @param params.arrival    - Destination city name (e.g., "上海")
   * @param params.date       - Departure date (YYYY-MM-DD). Optional.
   * @param params.passengers - Number of passengers. Defaults to 1 (used in real impl).
   *
   * @returns FlightSearchResult — flights array on success, empty on failure.
   */
  async searchLowPriceFlights(
    params: LowPriceFlightSearchRequest,
  ): Promise<FlightSearchResult> {
    this.logger.log(
      `[FlightService] searchLowPriceFlights: ${JSON.stringify(params)}`,
    );

    try {
      // TODO: Replace with real implementation (database query or external API).
      const mockFlights = this.generateMockFlights(params);

      return {
        success: true,
        flights: mockFlights,
        totalCount: mockFlights.length,
        message: `找到 ${mockFlights.length} 个航班`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[FlightService] searchLowPriceFlights error: ${errorMessage}`,
      );

      return {
        success: false,
        flights: [],
        totalCount: 0,
        message: `搜索失败: ${errorMessage}`,
      };
    }
  }

  /**
   * Search for low-price flights using a segments array.
   * - Single element  = one-way trip
   * - Two elements    = round trip
   *
   * @param params.segments   - Array of flight segments (city pairs + optional dates)
   * @param params.passengers - Number of passengers. Defaults to 1.
   *
   * @returns FlightSearchResult — combined flights from all segments.
   */
  async searchLowPriceFlightsWithSegments(
    params: LowPriceFlightSearchSegmentsRequest,
  ): Promise<FlightSearchResult> {
    this.logger.log(
      `[FlightService] searchLowPriceFlightsWithSegments: ${JSON.stringify(params)}`,
    );

    try {
      // TODO: Replace with real implementation.
      const allFlights: Flight[] = [];

      for (const segment of params.segments) {
        const segmentFlights = this.generateMockFlights({
          departure: segment.departure,
          arrival: segment.arrival,
          date: segment.date,
        });
        allFlights.push(...segmentFlights);
      }

      return {
        success: true,
        flights: allFlights,
        totalCount: allFlights.length,
        message: `找到 ${allFlights.length} 个航班（${params.segments.length} 个航段）`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[FlightService] searchLowPriceFlightsWithSegments error: ${errorMessage}`,
      );

      return {
        success: false,
        flights: [],
        totalCount: 0,
        message: `搜索失败: ${errorMessage}`,
      };
    }
  }

  /**
   * Get a single flight by its unique ID.
   *
   * @param id - The flight identifier (e.g., "CA1234-2026-03-27")
   *
   * @returns Flight object if found, null otherwise.
   */
  async getFlightById(id: string): Promise<Flight | null> {
    this.logger.log(`[FlightService] getFlightById: ${id}`);

    // TODO: Replace with real database lookup or external API call.
    // Currently returns mock data regardless of the id.
    return {
      id,
      flightNumber: 'CA1234',
      departure: '北京',
      arrival: '上海',
      departureTime: '08:00',
      arrivalTime: '10:30',
      price: 580,
      detailInfo: {
        baggage: '20kg免费托运',
        cabinClass: '经济舱',
        aircraft: '波音737',
        duration: '2h30m',
        stops: 0,
        nextDay: false,
      },
    };
  }

  /**
   * Generate mock flight data for development and testing.
   *
   * In production, replace this with actual database queries or external API calls.
   *
   * @param params.departure - Origin city
   * @param params.arrival  - Destination city
   * @param params.date      - Departure date (YYYY-MM-DD)
   */
  private generateMockFlights(params: {
    departure?: string;
    arrival?: string;
    date?: string;
  }): Flight[] {
    const departure = params.departure || '北京';
    const arrival = params.arrival || '上海';
    const date = params.date || new Date().toISOString().split('T')[0];

    const flightNumbers = ['CA1234', 'MU5678', 'CZ9012', 'HU3456', '3U7890'];
    const basePrices = [380, 480, 580, 680, 780];

    return flightNumbers.map((flightNumber, index) => ({
      id: `${flightNumber}-${date}`,
      flightNumber,
      departure,
      arrival,
      departureTime: `${6 + index}:${(index * 10) % 60}`.padStart(5, '0'),
      arrivalTime: `${9 + index}:${(index * 10 + 30) % 60}`.padStart(5, '0'),
      price: (basePrices[index] ?? 0) + Math.floor(Math.random() * 100),
      detailInfo: {
        baggage: index % 2 === 0 ? '20kg免费托运' : '15kg免费托运',
        cabinClass: index < 2 ? '经济舱' : '超级经济舱',
        aircraft: index % 2 === 0 ? '波音737' : '空客A320',
        duration: `${2 + (index % 2)}h${(index * 15) % 60}m`,
        stops: index % 3 === 0 ? 0 : 1,
        nextDay: false,
      },
    }));
  }
}
