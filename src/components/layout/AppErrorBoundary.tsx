import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '@/lib/logger';
import { tryRecoverFromStaleChunk } from '@/utils/chunkRecovery';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError('AppErrorBoundary', error);
    if (info.componentStack) {
      logError('AppErrorBoundary.componentStack', new Error(info.componentStack));
    }
    tryRecoverFromStaleChunk(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-6">Please refresh the page or try again later.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white bg-gray-900 hover:bg-black"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
