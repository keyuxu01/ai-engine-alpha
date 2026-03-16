import { createMcpHandler } from 'mcp-handler';
import { createMcpServer } from './mcp_sever';

const handler = createMcpHandler(async () => {
  const server = await createMcpServer();
  return server;
});

export { handler as GET, handler as POST };
