/**
 * Flight Module — Business logic for flight operations.
 *
 * This module contains the core FlightService that handles all flight-related
 * business logic (searching, filtering, pricing, etc.).
 *
 * Design notes:
 *  - FlightService is intentionally decoupled from MCP concerns (Tools, Resources).
 *    The MCP layer (FlightTool) depends on FlightService, not the other way around.
 *    This makes FlightService reusable across REST controllers, background jobs, etc.
 *
 *  - Import this module wherever you need FlightService. McpModule already re-exports
 *    it, so importing McpModule transitively provides FlightService too.
 *
 * @see FlightTool (apps/service-ai-platfrom/src/modules/mcp/flight.tool.ts) for MCP integration.
 */
import { Module } from '@nestjs/common';

import { FlightService } from './flight.service';

/**
 * FlightModule — provides flight business logic.
 *
 * Rules:
 *  - Do NOT import or declare FlightTool here. FlightTool belongs to the MCP module.
 *  - Do NOT import McpModule here. That creates a circular dependency.
 *
 * To use FlightService + FlightTool together, import McpModule instead.
 */
@Module({
  providers: [FlightService],
  exports: [FlightService],
})
export class FlightModule {}
