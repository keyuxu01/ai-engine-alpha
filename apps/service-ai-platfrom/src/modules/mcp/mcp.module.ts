/**
 * MCP Module — Entry point for the AI Engine MCP Server.
 *
 * Architecture:
 *  - McpModule.forRoot() registers the MCP server (Streamable HTTP transport) with NestJS.
 *    All @Tool, @Resource, @ResourceTemplate, and @Prompt decorated providers in THIS
 *    module are automatically discovered by McpRegistryDiscoveryService during bootstrap.
 *    No manual registration needed — just decorate your classes and add them to providers.
 *
 *  - For tools in OTHER modules, use McpModule.forFeature([ToolClass], 'server-name')
 *    to register them to a specific MCP server.
 *    @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/tool-discovery-and-registration.md
 *
 * Transport:
 *  - STREAMABLE_HTTP: JSON-RPC over POST /mcp. Suitable for web clients and AI agents.
 *  - enableJsonResponse: true — responses are JSON (not SSE streams), simpler for clients.
 *  - statelessMode: true — no session management; each request is independent.
 *
 * Security note:
 *  - Add guards (e.g., McpAuthJwtGuard) to protect the server from unauthorized access.
 *  - Mark individual tools with @PublicTool() to allow unauthenticated access.
 *    @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/per-tool-authorization.md
 *
 * Multiple servers:
 *  - Call McpModule.forRoot() multiple times with unique `name` fields to create
 *    multiple isolated MCP servers, each with its own endpoint.
 *    @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/dynamic-capabilities.md#multi-server-isolation
 *
 * @see https://github.com/rekog-labs/MCP-Nest/blob/main/docs/server-examples.md
 * @see https://modelcontextprotocol.io/specification/2025-06-18
 */
import { Module } from '@nestjs/common';
import { McpModule as RekogMcpModule, McpTransportType } from '@rekog/mcp-nest';

import { FlightModule } from '../flight/flight.module';
import { FlightTool } from './flight.tool';

@Module({
  imports: [
    /**
     * MCP Server root — registers the server with NestJS DI.
     *
     * Transport configuration:
     *   STREAMABLE_HTTP — enables POST /mcp JSON-RPC endpoint.
     *   Only this transport is enabled (SSE and STDIO are disabled).
     *
     * Stateless mode (sessionIdGenerator: undefined):
     *   Each HTTP request is treated independently. No server-side session state.
     *   Recommended for REST-like usage where clients manage their own state.
     *
     * For session-based usage (recommended for browser clients):
     *   Set sessionIdGenerator: () => randomUUID() and statelessMode: false.
     *   This enables POST /mcp, GET /mcp (SSE), and DELETE /mcp endpoints.
     */
    RekogMcpModule.forRoot({
      name: 'ai-engine-mcp-server',
      version: '1.0.0',
      description: 'AI Engine MCP Server — 低价机票查询',
      transport: [McpTransportType.STREAMABLE_HTTP],
      streamableHttp: {
        enableJsonResponse: true,
        sessionIdGenerator: undefined,
        statelessMode: true,
      },
    }),

    /**
     * FlightModule is imported here so that:
     *   1. FlightTool (a provider in THIS module) can inject FlightService.
     *   2. Other modules importing FlightModule get the same singleton instance
     *      of FlightService through NestJS's module graph.
     */
    FlightModule,
  ],

  /**
   * Providers declared here are auto-discovered by McpRegistryDiscoveryService.
   * All @Tool, @Resource, @ResourceTemplate, and @Prompt decorated methods
   * in these classes are registered with the MCP server at bootstrap.
   */
  providers: [FlightTool],

  /**
   * Re-exporting FlightModule so consumers of McpModule also get access to
   * FlightService (useful for other modules that need to inject FlightService
   * without directly importing FlightModule).
   */
  exports: [RekogMcpModule, FlightModule],
})
export class McpModule {}
