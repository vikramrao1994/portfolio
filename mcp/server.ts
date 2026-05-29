import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./createServer";

async function main() {
  const server = createMcpServer("local-file");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[application-documents MCP] Server running on stdio");
}

main().catch((err) => {
  console.error("[application-documents MCP] Fatal error:", err);
  process.exit(1);
});
