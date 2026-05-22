// Simple structured logging utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

function formatTimestamp() {
  return new Date().toISOString();
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }
  return {
    message: String(error),
  };
}

function log(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown) {
  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...(context && { context }),
    ...(error && { error: formatError(error) }),
  };

  // In production, you'd send this to a logging service (e.g., Pino, Winston, Datadog)
  const logOutput = JSON.stringify(entry);
  
  if (level === 'error') {
    console.error(logOutput);
  } else if (level === 'warn') {
    console.warn(logOutput);
  } else {
    console.log(logOutput);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, any>) => log('debug', message, context),
  info: (message: string, context?: Record<string, any>) => log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
  error: (message: string, error?: unknown, context?: Record<string, any>) => 
    log('error', message, context, error),
};
