import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Switched to constructor for state initialization to support older environments
  // that may not handle class field initializers, which can cause type errors.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-red-50 p-4 text-center">
          <div className="text-7xl mb-4">😢</div>
          <h1 className="text-4xl font-black text-red-600 mb-2">Oops! Something went wrong.</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            The game encountered an unexpected error. Please try restarting.
          </p>
          <Button 
            color="red" 
            size="lg"
            onClick={() => {
              // Clear any potentially corrupted state and reload
              localStorage.clear();
              window.location.reload();
            }}
          >
            Restart App
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
