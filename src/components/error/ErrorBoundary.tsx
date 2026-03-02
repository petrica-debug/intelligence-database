"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red/8 flex items-center justify-center mb-5">
            <AlertTriangle size={24} className="text-red" />
          </div>
          <h2 className="text-lg font-bold text-text mb-2">Something went wrong</h2>
          <p className="text-sm text-text-2 mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
