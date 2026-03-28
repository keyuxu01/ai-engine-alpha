import { createMcpHandler } from 'mcp-handler';
import {
  SEARCH_FLIGHTS_TOOL,
  GET_FLIGHT_DETAIL_TOOL,
  SEARCH_USERS_TOOL,
  GET_USER_DETAIL_TOOL,
  searchFlightsHandler,
  getFlightDetailHandler,
  searchUsersHandler,
  getUserDetailHandler,
} from './mcp_sever';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
// Force dynamic rendering for MCP endpoint
export const runtime = 'nodejs';

const handler = createMcpHandler(
  async (server) => {
    // ── Tool 1: search_flights ──────────────────────────────────────────────
    server.registerTool(
      SEARCH_FLIGHTS_TOOL,
      {
        title: 'Search Flights',
        description:
          '搜索航班。返回航班列表和 flightIds。' +
          'Use this first to find available flights, then call get_flight_detail with a specific flight id for more info.',
        inputSchema: {
          departure: z.string().optional().describe('出发城市，例如 "北京"'),
          arrival: z.string().optional().describe('到达城市，例如 "上海"'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      searchFlightsHandler,
    );

    // ── Tool 2: get_flight_detail ────────────────────────────────────────────
    server.registerTool(
      GET_FLIGHT_DETAIL_TOOL,
      {
        title: 'Get Flight Detail',
        description:
          '获取指定航班的详细信息（机型、舱位、行李、机上设施等）。' +
          ' Call this after search_flights to get details for a specific flight.',
        inputSchema: {
          id: z.string().describe('航班 ID，从 search_flights 的返回值中获取'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      getFlightDetailHandler,
    );

    // ── Tool 3: search_users ──────────────────────────────────────────────────
    server.registerTool(
      SEARCH_USERS_TOOL,
      {
        title: 'Search Users',
        description:
          '搜索用户。可按姓名或角色过滤。返回用户列表和 userIds。' +
          ' Then call get_user_detail with a specific user id for more info.',
        inputSchema: {
          name: z.string().optional().describe('用户名关键词'),
          role: z.string().optional().describe('用户角色，例如 "admin"、"user"'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      searchUsersHandler,
    );

    // ── Tool 4: get_user_detail ──────────────────────────────────────────────
    server.registerTool(
      GET_USER_DETAIL_TOOL,
      {
        title: 'Get User Detail',
        description:
          '获取指定用户的详细信息（地址、电话、邮箱等）。' +
          ' Call this after search_users to get details for a specific user.',
        inputSchema: {
          id: z.string().describe('用户 ID，从 search_users 的返回值中获取'),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        },
      },
      getUserDetailHandler,
    );
  },
  {
    serverInfo: {
      name: 'ai-engine-mcp-server',
      version: '1.0.0',
    },
  },
  {
    basePath: '/api/mcp-alpha',
    verboseLogs: true,
    disableSse: true,
  },
);

export { handler as GET, handler as POST };
