// MCP sever 挂载在此
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createUIResource } from '@mcp-ui/server';
import {
  registerAppResource,
  registerAppTool,
} from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { getFlightListHtmlString } from '@repo/mcp-ui-components/html-strings';
import { dateBase as mockDataBase } from './constants';

// 直接从 mcp-ui 包导入函数

export async function createMcpServer() {
  const mcpServer = new McpServer({
    name: 'langchain-mcp-server',
    version: '1.0.0',
    description: 'LangChain MCP Server of AI Engine Alpha',
  });

  // ========== 创建 UI 资源 ==========
  const flightListUI = createUIResource({
    uri: 'ui://ai-engine/flight-list',
    content: { type: 'rawHtml', htmlString: getFlightListHtmlString() },
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

  return mcpServer;
}

// 导出默认实例
export const mcpServer = (async () => await createMcpServer())();
