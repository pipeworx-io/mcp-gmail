# mcp-gmail

Gmail MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `gmail_list_messages` | List messages in your inbox with optional filtering by label or read status. Returns message IDs, thread IDs, and preview text. Use gmail_search for complex queries like date ranges or attachments. |
| `gmail_get_message` | Fetch full email details by message ID. Returns headers, subject, body text, sender, recipients, attachments, and applied labels. |
| `gmail_search` | Search emails using Gmail query syntax (e.g., \'from:sender@example.com\', \'subject:invoice\', \'has:attachment\', \'after:2024/01/01\', \'is:unread\'). Returns matching message IDs. |
| `gmail_send` | Send an email with recipient, subject, and body text. Optionally add CC, BCC, reply-to address, and file attachments. |
| `gmail_list_labels` | Get all your labels including system folders (INBOX, SENT, TRASH, DRAFTS) and custom labels. Returns label names and IDs for filtering or organizing. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "gmail": {
      "url": "https://gateway.pipeworx.io/gmail/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Gmail data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
