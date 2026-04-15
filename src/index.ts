interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Gmail MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.gmail.
 * Tools: list messages, get message, search, send email, list labels.
 */


interface GmailContext {
  gmail?: { accessToken: string };
}

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function gFetch(ctx: GmailContext, url: string, options: RequestInit = {}) {
  if (!ctx.gmail) {
    return { error: 'connection_required', message: 'Connect your Google account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.gmail.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'gmail_list_messages',
    description: 'List messages in the user\'s Gmail inbox. Optionally filter with a search query. Returns message IDs and thread IDs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Gmail search query to filter messages (e.g., "from:alice subject:meeting")' },
        max_results: { type: 'number', description: 'Maximum number of messages to return (default 10, max 100)' },
        page_token: { type: 'string', description: 'Token for fetching the next page of results' },
      },
      required: [],
    },
  },
  {
    name: 'gmail_get_message',
    description: 'Get a specific Gmail message by ID. Returns full message details including headers, snippet, body, and labels.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        message_id: { type: 'string', description: 'The ID of the message to retrieve' },
        format: { type: 'string', enum: ['minimal', 'full', 'raw', 'metadata'], description: 'Format of the returned message (default: full)' },
      },
      required: ['message_id'],
    },
  },
  {
    name: 'gmail_search',
    description: 'Search Gmail messages using Gmail query syntax. Supports operators like from:, to:, subject:, has:attachment, after:, before:, is:unread, label:, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Gmail search query (e.g., "from:bob@example.com after:2024/01/01 has:attachment")' },
        max_results: { type: 'number', description: 'Maximum number of messages to return (default 10, max 100)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'gmail_send',
    description: 'Send an email from the authenticated Gmail account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body text (plain text)' },
        cc: { type: 'string', description: 'CC recipients (comma-separated email addresses)' },
        bcc: { type: 'string', description: 'BCC recipients (comma-separated email addresses)' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'gmail_list_labels',
    description: 'List all labels in the user\'s Gmail account, including system labels (INBOX, SENT, TRASH, etc.) and user-created labels.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

function buildRawEmail(to: string, subject: string, body: string, cc?: string, bcc?: string): string {
  const lines: string[] = [];
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push(`Subject: ${subject}`);
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push('MIME-Version: 1.0');
  lines.push('');
  lines.push(body);
  const raw = lines.join('\r\n');
  // Base64url encode
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as GmailContext;
  delete args._context;

  switch (name) {
    case 'gmail_list_messages': {
      const maxResults = Math.min(100, Math.max(1, (args.max_results as number) ?? 10));
      const params = new URLSearchParams({ maxResults: String(maxResults) });
      if (args.query) params.set('q', args.query as string);
      if (args.page_token) params.set('pageToken', args.page_token as string);
      return gFetch(context, `${API}/messages?${params}`);
    }
    case 'gmail_get_message': {
      const messageId = args.message_id as string;
      const format = (args.format as string) ?? 'full';
      const params = new URLSearchParams({ format });
      return gFetch(context, `${API}/messages/${encodeURIComponent(messageId)}?${params}`);
    }
    case 'gmail_search': {
      const query = args.query as string;
      const maxResults = Math.min(100, Math.max(1, (args.max_results as number) ?? 10));
      const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
      return gFetch(context, `${API}/messages?${params}`);
    }
    case 'gmail_send': {
      const { to, subject, body, cc, bcc } = args as { to: string; subject: string; body: string; cc?: string; bcc?: string };
      const raw = buildRawEmail(to, subject, body, cc, bcc);
      return gFetch(context, `${API}/messages/send`, {
        method: 'POST',
        body: JSON.stringify({ raw }),
      });
    }
    case 'gmail_list_labels': {
      return gFetch(context, `${API}/labels`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 }, provider: 'gmail' } satisfies McpToolExport;
