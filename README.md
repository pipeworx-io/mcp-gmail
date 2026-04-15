# mcp-gmail

Gmail MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `gmail_list_messages` | List messages in the user\'s Gmail inbox. Optionally filter with a search query. Returns message IDs and thread IDs. |
| `gmail_get_message` | Get a specific Gmail message by ID. Returns full message details including headers, snippet, body, and labels. |
| `gmail_search` | Search Gmail messages using Gmail query syntax. Supports operators like from:, to:, subject:, has:attachment, after:, before:, is:unread, label:, etc. |
| `gmail_send` | Send an email from the authenticated Gmail account. |
| `gmail_list_labels` | List all labels in the user\'s Gmail account, including system labels (INBOX, SENT, TRASH, etc.) and user-created labels. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "gmail": {
      "url": "https://gateway.pipeworx.io/gmail/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use gmail
```

## License

MIT
