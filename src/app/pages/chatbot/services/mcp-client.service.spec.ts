import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '../../../../environments/environment';

const { connectMock, callToolMock, state } = vi.hoisted(() => ({
  connectMock: vi.fn().mockResolvedValue(undefined),
  callToolMock: vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'mocked response' }],
  }),
  state: { lastTransportUrl: undefined as URL | undefined },
}));

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this['connect'] = connectMock;
    this['callTool'] = callToolMock;
  }),
}));

vi.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: vi.fn().mockImplementation(function (url: URL) {
    state.lastTransportUrl = url;
  }),
}));

// Imported after the mocks above so the service picks up the mocked SDK.
import { McpClientService } from './mcp-client.service';

describe('McpClientService', () => {
  beforeEach(() => {
    connectMock.mockClear();
    callToolMock.mockClear();
    state.lastTransportUrl = undefined;
    TestBed.configureTestingModule({});
  });

  it('connects to `${environment.apiUrl}/sse`, not a hardcoded localhost URL', async () => {
    TestBed.inject(McpClientService);
    await vi.waitFor(() => expect(connectMock).toHaveBeenCalled());

    expect(state.lastTransportUrl?.toString()).toBe(`${environment.apiUrl}/sse`);
  });

  it('marks isConnected true once the client connects', async () => {
    const service = TestBed.inject(McpClientService);
    await vi.waitFor(() => expect(service.isConnected()).toBe(true));
  });

  it('sendMessage() adds the user message then the bot reply from callTool', async () => {
    const service = TestBed.inject(McpClientService);
    await vi.waitFor(() => expect(service.isConnected()).toBe(true));

    await service.sendMessage('What is this document about?');

    expect(callToolMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'query_rag',
        arguments: expect.objectContaining({ query: 'What is this document about?' }),
      })
    );
    const messages = service.messages();
    expect(messages.at(-2)?.role).toBe('user');
    expect(messages.at(-1)).toMatchObject({ role: 'bot', content: 'mocked response' });
  });

  it('sendMessage() ignores blank input', async () => {
    const service = TestBed.inject(McpClientService);
    await vi.waitFor(() => expect(service.isConnected()).toBe(true));

    await service.sendMessage('   ');
    expect(service.messages().length).toBe(0);
  });

  it('clearSession() resets chat state and rotates the session id', async () => {
    const service = TestBed.inject(McpClientService);
    await vi.waitFor(() => expect(service.isConnected()).toBe(true));
    await service.sendMessage('hello');
    const previousSessionId = service.sessionId();

    service.clearSession();

    expect(service.messages().length).toBe(0);
    expect(service.pdfUploaded()).toBe(false);
    expect(service.sessionId()).not.toBe(previousSessionId);
  });
});
