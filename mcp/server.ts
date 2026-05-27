import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./createServer";

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[cover-letter MCP] Server running on stdio");
}

main().catch((err) => {
  console.error("[cover-letter MCP] Fatal error:", err);
  process.exit(1);
});
