import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handleMcp(@Res() res: Response) {
    const mcpServer = this.mcpService.getMcpServer();

    if (!mcpServer) {
      res.status(500).json({ error: 'MCP server not initialized' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      // Get the underlying Server instance from MCP SDK
      const server = (mcpServer as any).server;

      // Start SSE connection using MCP SDK's method
      const cleanup = server.sse(
        '/mcp',
        {},
        {
          send: (data: string) => {
            res.write(data);
          },
          close: () => {
            res.end();
          },
        }
      );

      // Handle connection close
      res.on('close', () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      });
    } catch (error) {
      console.error('MCP SSE connection error:', error);
      res.status(500).json({ error: 'Failed to connect to MCP server' });
    }
  }

  @Get('sse')
  @HttpCode(HttpStatus.OK)
  async handleSse(@Res() res: Response) {
    return this.handleMcp(res);
  }
}
