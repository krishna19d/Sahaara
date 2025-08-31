// Enhanced error handling with user-friendly messages and retry mechanisms

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  action?: () => void;
}

export class ErrorHandler {
  static createError(
    code: string, 
    message: string, 
    userMessage: string, 
    severity: AppError['severity'] = 'medium',
    retryable: boolean = true
  ): AppError {
    return {
      code,
      message,
      userMessage,
      severity,
      retryable
    };
  }

  static handleNetworkError(error: unknown): AppError {
    const err = error as { status?: number; message?: string };
    
    if (!navigator.onLine) {
      return this.createError(
        'NETWORK_OFFLINE',
        'Network connection lost',
        'You appear to be offline. Please check your internet connection and try again.',
        'medium',
        true
      );
    }

    if (err.status === 403) {
      return this.createError(
        'API_FORBIDDEN',
        'API access forbidden',
        'Our AI service is temporarily unavailable. Don\'t worry - you can still use Sahaara with our local support system.',
        'low',
        false
      );
    }

    if (err.status === 429) {
      return this.createError(
        'API_RATE_LIMIT',
        'Rate limit exceeded',
        'Too many requests right now. Please wait a moment and try again.',
        'medium',
        true
      );
    }

    return this.createError(
      'NETWORK_ERROR',
      err.message || 'Network request failed',
      'Something went wrong connecting to our servers. Please try again in a moment.',
      'medium',
      true
    );
  }

  static handleDataError(error: unknown): AppError {
    const err = error as { code?: string; message?: string };
    
    if (err.code === 'permission-denied') {
      return this.createError(
        'DATA_PERMISSION_DENIED',
        'Firebase permission denied',
        'Unable to sync your data. Your information is still saved locally and Sahaara will continue to work.',
        'low',
        false
      );
    }

    if (err.code === 'unavailable') {
      return this.createError(
        'DATA_UNAVAILABLE',
        'Firebase service unavailable',
        'Data sync is temporarily unavailable. Your session data is safely stored locally.',
        'low',
        true
      );
    }

    return this.createError(
      'DATA_ERROR',
      err.message || 'Data operation failed',
      'There was an issue saving your data, but your session will continue normally.',
      'low',
      true
    );
  }

  static handleChatError(error: unknown): AppError {
    const err = error as { message?: string };
    
    return this.createError(
      'CHAT_ERROR',
      err.message || 'Chat request failed',
      'I\'m having trouble responding right now, but I\'m still here to support you. Try sending your message again.',
      'medium',
      true
    );
  }

  static handleCrisisDetectionError(error: unknown): AppError {
    const err = error as { message?: string };
    
    return this.createError(
      'CRISIS_DETECTION_ERROR',
      err.message || 'Crisis detection failed',
      'I want to make sure you\'re safe. If you\'re in crisis, please reach out to: Kiran 1800-599-0019 or Vandrevala 9999 666 555',
      'critical',
      false
    );
  }
}

// React hook for error handling
export function useErrorHandler() {
  const showError = (error: AppError) => {
    // In a real app, this would integrate with a toast/notification system
    console.error(`[${error.code}] ${error.message}`);
    
    // For now, show a browser alert (in production, replace with proper UI)
    if (error.severity === 'critical') {
      alert(error.userMessage);
    } else {
      console.log('User message:', error.userMessage);
    }
  };

  const handleAsync = async <T>(
    operation: () => Promise<T>,
    errorType: 'network' | 'data' | 'chat' | 'crisis' = 'network'
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      let appError: AppError;
      switch (errorType) {
        case 'network':
          appError = ErrorHandler.handleNetworkError(error);
          break;
        case 'data':
          appError = ErrorHandler.handleDataError(error);
          break;
        case 'chat':
          appError = ErrorHandler.handleChatError(error);
          break;
        case 'crisis':
          appError = ErrorHandler.handleCrisisDetectionError(error);
          break;
        default:
          appError = ErrorHandler.handleNetworkError(error);
      }
      
      showError(appError);
      return null;
    }
  };

  const retry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          const appError = ErrorHandler.handleNetworkError(error);
          showError(appError);
          return null;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    return null;
  };

  return { showError, handleAsync, retry };
}

// Error boundary for React components
export class AppErrorBoundary extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AppErrorBoundary';
  }
}

// Utility functions
export function isOnline(): boolean {
  return navigator.onLine;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function shouldRetry(error: unknown): boolean {
  const err = error as { status?: number };
  // Don't retry on client errors (4xx) except 429 (rate limit)
  if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
    return false;
  }
  
  // Retry on server errors (5xx) and network errors
  return true;
}
