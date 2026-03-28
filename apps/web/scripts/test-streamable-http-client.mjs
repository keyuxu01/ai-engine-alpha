import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// eslint-disable-next-line no-undef
const origin = process.argv[2] || 'http://localhost:3000/api/mcp-alpha/mcp';

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}`));

  const client = new Client(
    {
      name: 'example-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    },
  );

  await client.connect(transport);

  console.log('Connected', client.getServerCapabilities());

  const result = await client.listTools();
  console.log(result);
}

main();
