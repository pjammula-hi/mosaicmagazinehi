import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // In production, you could send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-8 brutal-shadow max-w-2xl w-full -rotate-1">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-400 border-4 border-black brutal-shadow-sm rotate-6 mb-4">
                <AlertTriangle className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              
              <h1 className="text-4xl text-black font-black uppercase mb-2">
                Oops! Something Broke
              </h1>
              
              <div className="inline-block bg-red-300 px-4 py-2 border-3 border-black rotate-1">
                <p className="text-black font-bold text-sm">
                  Don't worry - your work is safe!
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-yellow-300 border-4 border-black p-4 brutal-shadow-sm mb-6 -rotate-1">
              <p className="text-black font-bold text-sm mb-2">
                <strong className="font-black uppercase">What happened:</strong>
              </p>
              <p className="text-black font-mono text-xs bg-white border-2 border-black p-2">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-4 bg-cyan-400 text-black font-black uppercase border-4 border-black brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" strokeWidth={3} />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full px-6 py-4 bg-white text-black font-black uppercase border-4 border-black brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" strokeWidth={3} />
                Go to Home
              </button>
            </div>

            {/* Developer Info (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 bg-gray-100 border-4 border-black p-4">
                <summary className="text-black font-black text-sm uppercase cursor-pointer">
                  Developer Info
                </summary>
                <pre className="mt-4 text-xs overflow-auto p-4 bg-white border-2 border-black">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-gray-700 text-xs font-bold">
                If this keeps happening, please contact your administrator and include:
              </p>
              <p className="text-gray-600 text-xs font-mono mt-2">
                Error Code: {Date.now()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
