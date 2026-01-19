/**
 * Meshy API Client
 *
 * Base client with authentication, error handling, and rate limiting.
 * All task executors compose this client for API operations.
 *
 * @see https://docs.meshy.ai/en/api/authentication
 * @see https://docs.meshy.ai/en/api/errors
 * @see https://docs.meshy.ai/en/api/rate-limits
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MeshyClientConfig {
  apiKey: string;
  baseUrl?: string;
  /** Default timeout for streaming operations (ms) */
  streamTimeoutMs?: number;
  /** Max retries for rate limit errors */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  retryDelayMs?: number;
}

export interface MeshyError {
  message: string;
  statusCode: number;
  isRateLimit: boolean;
  isAuthError: boolean;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';

export interface TaskResult<T = unknown> {
  id: string;
  status: TaskStatus;
  progress: number;
  result?: T;
  task_error?: { message: string };
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class MeshyApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly isRateLimit: boolean = false,
    public readonly isAuthError: boolean = false
  ) {
    super(message);
    this.name = 'MeshyApiError';
  }
}

export class RateLimitError extends MeshyApiError {
  constructor(message: string) {
    super(message, 429, true, false);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends MeshyApiError {
  constructor(message: string) {
    super(message, 401, false, true);
    this.name = 'AuthenticationError';
  }
}

export class InsufficientCreditsError extends MeshyApiError {
  constructor(message: string) {
    super(message, 402, false, false);
    this.name = 'InsufficientCreditsError';
  }
}

// ============================================================================
// CLIENT IMPLEMENTATION
// ============================================================================

export class MeshyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly streamTimeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(config: MeshyClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? 'https://api.meshy.ai/openapi').replace(/\/$/, '');
    this.streamTimeoutMs = config.streamTimeoutMs ?? 600_000; // 10 minutes
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  // --------------------------------------------------------------------------
  // Core HTTP Methods
  // --------------------------------------------------------------------------

  async get<T = unknown>(path: string, query?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async delete(path: string): Promise<void> {
    await this.request('DELETE', path);
  }

  // --------------------------------------------------------------------------
  // Task Streaming (SSE)
  // --------------------------------------------------------------------------

  /**
   * Stream task progress via Server-Sent Events until terminal state
   */
  async streamUntilComplete<T = unknown>(path: string): Promise<TaskResult<T>> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'text/event-stream',
      },
      signal: AbortSignal.timeout(this.streamTimeoutMs),
    });

    await this.ensureOk(response);

    if (!response.body) {
      throw new MeshyApiError('Streaming response did not include a body', 500);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: TaskResult<T> | null = null;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim().startsWith('data:')) continue;

          const payload = line.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(payload) as TaskResult<T>;
            finalResult = parsed;

            // Log progress
            if (parsed.progress !== undefined) {
              process.stdout.write(`\r  Progress: ${parsed.progress}%`);
            }

            // Check for terminal states
            if (['SUCCEEDED', 'FAILED', 'CANCELED'].includes(parsed.status)) {
              console.log(); // New line after progress
              await reader.cancel();
              return parsed;
            }
          } catch {
            // Ignore parse errors for non-JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (finalResult) return finalResult;
    throw new MeshyApiError('No data received from stream', 500);
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const url = this.buildUrl(path, query);

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        await this.ensureOk(response);

        // Handle empty responses (e.g., DELETE)
        const text = await response.text();
        if (!text) return undefined as T;

        return JSON.parse(text) as T;
      } catch (error) {
        lastError = error as Error;

        // Only retry on rate limit errors
        if (error instanceof RateLimitError && attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          console.log(`  Rate limited. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean>): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalized}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async ensureOk(response: Response): Promise<void> {
    if (response.ok) return;

    let message = 'Unknown error';
    try {
      const body = await response.json() as { message?: string };
      message = body.message ?? message;
    } catch {
      message = await response.text().catch(() => message);
    }

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 402:
        throw new InsufficientCreditsError(message);
      case 429:
        throw new RateLimitError(message);
      default:
        throw new MeshyApiError(message, response.status);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
