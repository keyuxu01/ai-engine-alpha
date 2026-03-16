// MCP sever 挂载在此
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createUIResource } from '@mcp-ui/server';
import {
  registerAppResource,
  registerAppTool,
} from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import {
  getFlightListHtmlString,
  getFlightDetailHtmlString,
  getUserListHtmlString,
  getUserDetailHtmlString,
} from '@repo/mcp-ui-components/html-strings';
import { dateBase as mockDataBase } from './constants';

// 直接从 mcp-ui 包导入函数

export async function createMcpServer() {
  const mcpServer = new McpServer({
    name: 'langchain-mcp-server',
    version: '1.0.0',
    description: 'LangChain MCP Server of AI Engine Alpha',
  });

  // ========== 创建 UI 资源 ==========
  const flightListUI = await createUIResource({
    uri: 'ui://ai-engine/flight-list',
    content: { type: 'rawHtml', htmlString: getFlightListHtmlString() },
    encoding: 'text',
  });

  const flightDetailUI = await createUIResource({
    uri: 'ui://ai-engine/flight-detail',
    content: { type: 'rawHtml', htmlString: getFlightDetailHtmlString() },
    encoding: 'text',
  });

  const userListUI = await createUIResource({
    uri: 'ui://ai-engine/user-list',
    content: { type: 'rawHtml', htmlString: getUserListHtmlString() },
    encoding: 'text',
  });

  const userDetailUI = await createUIResource({
    uri: 'ui://ai-engine/user-detail',
    content: { type: 'rawHtml', htmlString: getUserDetailHtmlString() },
    encoding: 'text',
  });

  // 注册 Resource
  registerAppResource(
    mcpServer,
    'flight_list_ui',
    flightListUI.resource.uri,
    {},
    async () => ({ contents: [flightListUI.resource] }),
  );

  registerAppResource(
    mcpServer,
    'flight_detail_ui',
    flightDetailUI.resource.uri,
    {},
    async () => ({ contents: [flightDetailUI.resource] }),
  );

  registerAppResource(
    mcpServer,
    'user_list_ui',
    userListUI.resource.uri,
    {},
    async () => ({ contents: [userListUI.resource] }),
  );

  registerAppResource(
    mcpServer,
    'user_detail_ui',
    userDetailUI.resource.uri,
    {},
    async () => ({ contents: [userDetailUI.resource] }),
  );

  // ========== 注册 Tools ==========

  /**
   * @description 获取用户信息 list
   */
  registerAppTool(
    mcpServer,
    'get_user_list',
    {
      title: 'Get User List',
      description: 'Get a list of all users',
      inputSchema: z.object({}),
      _meta: {
        ui: { resourceUri: userListUI.resource.uri },
      },
    },
    async () => ({
      content: [
        { type: 'resource', resource: userListUI.resource },
        { type: 'text', text: JSON.stringify({ users: mockDataBase.userInfo }) },
      ],
    }),
  );

  /**
   * @description 获取某个用户信息 detail by id
   */
  registerAppTool(
    mcpServer,
    'get_user_detail',
    {
      title: 'Get User Detail',
      description: 'Get detailed information about a specific user',
      inputSchema: z.object({
        id: z.string().describe('User ID'),
      }),
      _meta: {
        ui: { resourceUri: userDetailUI.resource.uri },
      },
    },
    async ({ id }) => {
      const user = mockDataBase.userInfo.find(u => u.id === id);
      if (!user) {
        return {
          content: [{ type: 'text', text: `User with id ${id} not found` }],
        };
      }
      return {
        content: [
          { type: 'resource', resource: userDetailUI.resource },
          { type: 'text', text: JSON.stringify({ user }) },
        ],
      };
    },
  );

  /**
   * @description 获取航班信息 list
   */
  registerAppTool(
    mcpServer,
    'search_flights',
    {
      title: 'Search Flights',
      description: 'Search for available flights',
      inputSchema: z.object({
        departure: z.string().optional().describe('Departure city'),
        arrival: z.string().optional().describe('Arrival city'),
      }),
      _meta: {
        ui: { resourceUri: flightListUI.resource.uri },
      },
    },
    async ({ departure, arrival }) => {
      const allFlights = mockDataBase.flightSearchResults;
      let flights = Array.from(allFlights);
      if (departure) {
        flights = flights.filter(f => f.departure.includes(departure));
      }
      if (arrival) {
        flights = flights.filter(f => f.arrival.includes(arrival));
      }
      return {
        content: [
          { type: 'resource', resource: flightListUI.resource },
          { type: 'text', text: JSON.stringify({ flights }) },
        ],
      };
    },
  );

  /**
   * @description 获取某个航班信息 detail by id
   */
  registerAppTool(
    mcpServer,
    'get_flight_detail',
    {
      title: 'Get Flight Detail',
      description: 'Get detailed information about a specific flight',
      inputSchema: z.object({
        id: z.string().describe('Flight ID'),
      }),
      _meta: {
        ui: { resourceUri: flightDetailUI.resource.uri },
      },
    },
    async ({ id }) => {
      const flight = mockDataBase.flightSearchResults.find(f => f.id === id);
      if (!flight) {
        return {
          content: [{ type: 'text', text: `Flight with id ${id} not found` }],
        };
      }
      return {
        content: [
          { type: 'resource', resource: flightDetailUI.resource },
          { type: 'text', text: JSON.stringify({ flight }) },
        ],
      };
    },
  );

  return mcpServer;
}

// 导出默认实例
export const mcpServer = (async () => await createMcpServer())();
