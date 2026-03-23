import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerAppResource,
  registerAppTool,
} from '@modelcontextprotocol/ext-apps/server';
import { createUIResource } from '@mcp-ui/server';

import { z } from 'zod';
import {
  getFlightListHtmlString,
  getFlightDetailHtmlString,
  getUserListHtmlString,
  getUserDetailHtmlString,
} from '@repo/mcp-ui-components/html-strings';

import { mockFlights, mockUsers } from './constants/mockData';

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private mcpServer: McpServer | null = null;

  async onModuleInit() {
    await this.initializeMcpServer();
  }

  async onModuleDestroy() {
    // Cleanup if needed
  }

  private async initializeMcpServer() {
    this.mcpServer = new McpServer({
      name: 'ai-engine-mcp-server',
      version: '1.0.0',
      description: 'AI Engine MCP Server for flight and user management',
    });

    await this.createUIResources();
    this.registerResources();
    this.registerTools();
  }

  private async createUIResources() {
    // 创建航班列表 UI 资源
    const flightListUI = await createUIResource({
      uri: 'ui://ai-engine/flight-list',
      content: { type: 'rawHtml', htmlString: getFlightListHtmlString() },
      encoding: 'text',
    });

    // 创建航班详情 UI 资源
    const flightDetailUI = await createUIResource({
      uri: 'ui://ai-engine/flight-detail',
      content: { type: 'rawHtml', htmlString: getFlightDetailHtmlString() },
      encoding: 'text',
    });

    // 创建用户列表 UI 资源
    const userListUI = await createUIResource({
      uri: 'ui://ai-engine/user-list',
      content: { type: 'rawHtml', htmlString: getUserListHtmlString() },
      encoding: 'text',
    });

    // 创建用户详情 UI 资源
    const userDetailUI = await createUIResource({
      uri: 'ui://ai-engine/user-detail',
      content: { type: 'rawHtml', htmlString: getUserDetailHtmlString() },
      encoding: 'text',
    });

    // 存储资源引用
    (this as any).flightListUI = flightListUI;
    (this as any).flightDetailUI = flightDetailUI;
    (this as any).userListUI = userListUI;
    (this as any).userDetailUI = userDetailUI;
  }

  private registerResources() {
    if (!this.mcpServer) return;

    const flightListUI = (this as any).flightListUI;
    const flightDetailUI = (this as any).flightDetailUI;
    const userListUI = (this as any).userListUI;
    const userDetailUI = (this as any).userDetailUI;

    // 注册航班列表资源
    registerAppResource(
      this.mcpServer as any,
      'flight_list_ui',
      flightListUI.resource.uri,
      {},
      async () => ({ contents: [flightListUI.resource] }),
    );

    // 注册航班详情资源
    registerAppResource(
      this.mcpServer as any,
      'flight_detail_ui',
      flightDetailUI.resource.uri,
      {},
      async () => ({ contents: [flightDetailUI.resource] }),
    );

    // 注册用户列表资源
    registerAppResource(
      this.mcpServer as any,
      'user_list_ui',
      userListUI.resource.uri,
      {},
      async () => ({ contents: [userListUI.resource] }),
    );

    // 注册用户详情资源
    registerAppResource(
      this.mcpServer as any,
      'user_detail_ui',
      userDetailUI.resource.uri,
      {},
      async () => ({ contents: [userDetailUI.resource] }),
    );
  }

  private registerTools() {
    if (!this.mcpServer) return;

    // 获取 UI 资源引用
    const flightListUI = (this as any).flightListUI;
    const flightDetailUI = (this as any).flightDetailUI;
    const userListUI = (this as any).userListUI;
    const userDetailUI = (this as any).userDetailUI;

    // Tool: get_flight_list - 获取航班列表
    registerAppTool(
      this.mcpServer,
      'get_flight_list',
      {
        title: 'Get Flight List',
        description:
          'Get a list of all available flights. You can optionally filter by departure and arrival cities.',
        inputSchema: z.object({
          departure: z
            .string()
            .optional()
            .describe('Departure city (e.g., 北京, 上海)'),
          arrival: z
            .string()
            .optional()
            .describe('Arrival city (e.g., 北京, 上海)'),
        }),
        _meta: {
          ui: { resourceUri: flightListUI.resource.uri },
        },
      },
      async ({ departure, arrival }) => {
        let flights = [...mockFlights];

        if (departure) {
          flights = flights.filter((f) =>
            f.departure.toLowerCase().includes(departure.toLowerCase()),
          );
        }

        if (arrival) {
          flights = flights.filter((f) =>
            f.arrival.toLowerCase().includes(arrival.toLowerCase()),
          );
        }

        return {
          content: [
            { type: 'resource', resource: flightListUI.resource },
            {
              type: 'text',
              text: JSON.stringify(
                {
                  flights,
                  total: flights.length,
                  message: `Found ${flights.length} flights`,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    // Tool: get_flight_detail - 获取航班详情
    registerAppTool(
      this.mcpServer,
      'get_flight_detail',
      {
        title: 'Get Flight Detail',
        description:
          'Get detailed information about a specific flight by its ID',
        inputSchema: z.object({
          id: z.string().describe('Flight ID (e.g., 1, 2, 3)'),
        }),
        _meta: {
          ui: { resourceUri: flightDetailUI.resource.uri },
        },
      },
      async ({ id }) => {
        const flight = mockFlights.find((f) => f.id === id);

        if (!flight) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: 'Flight not found',
                    message: `No flight found with id: ${id}`,
                    availableIds: mockFlights.map((f) => f.id),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [
            { type: 'resource', resource: flightDetailUI.resource },
            {
              type: 'text',
              text: JSON.stringify({ flight }, null, 2),
            },
          ],
        };
      },
    );

    // Tool: get_user_list - 获取用户列表
    registerAppTool(
      this.mcpServer,
      'get_user_list',
      {
        title: 'Get User List',
        description: 'Get a list of all users in the system',
        inputSchema: z.object({}),
        _meta: {
          ui: { resourceUri: userListUI.resource.uri },
        },
      },
      async () => {
        return {
          content: [
            { type: 'resource', resource: userListUI.resource },
            {
              type: 'text',
              text: JSON.stringify(
                {
                  users: mockUsers,
                  total: mockUsers.length,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    // Tool: get_user_detail - 获取用户详情
    registerAppTool(
      this.mcpServer,
      'get_user_detail',
      {
        title: 'Get User Detail',
        description:
          'Get detailed information about a specific user by their ID',
        inputSchema: z.object({
          id: z.string().describe('User ID (e.g., 1, 2, 3)'),
        }),
        _meta: {
          ui: { resourceUri: userDetailUI.resource.uri },
        },
      },
      async ({ id }) => {
        const user = mockUsers.find((u) => u.id === id);

        if (!user) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: 'User not found',
                    message: `No user found with id: ${id}`,
                    availableIds: mockUsers.map((u) => u.id),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [
            { type: 'resource', resource: userDetailUI.resource },
            {
              type: 'text',
              text: JSON.stringify({ user }, null, 2),
            },
          ],
        };
      },
    );

    // Tool: search_flights - 搜索航班
    registerAppTool(
      this.mcpServer,
      'search_flights',
      {
        title: 'Search Flights',
        description: 'Search for flights between two cities',
        inputSchema: z.object({
          departure: z.string().describe('Departure city'),
          arrival: z.string().describe('Arrival city'),
        }),
        _meta: {
          ui: { resourceUri: flightListUI.resource.uri },
        },
      },
      async ({ departure, arrival }) => {
        const flights = mockFlights.filter(
          (f) =>
            f.departure.toLowerCase().includes(departure.toLowerCase()) &&
            f.arrival.toLowerCase().includes(arrival.toLowerCase()),
        );

        return {
          content: [
            { type: 'resource', resource: flightListUI.resource },
            {
              type: 'text',
              text: JSON.stringify(
                {
                  flights,
                  total: flights.length,
                  searchParams: { departure, arrival },
                  message: `Found ${flights.length} flights from ${departure} to ${arrival}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );
  }

  getMcpServer(): McpServer | null {
    return this.mcpServer;
  }
}
