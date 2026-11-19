import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
          <div className="card-elevated max-w-md w-full p-8 text-center">
            <div className="font-display font-display-bold text-4xl text-ink mb-4">⚠️</div>
            <h2 className="font-body font-body-semibold text-xl text-ink mb-2">
              Something went wrong
            </h2>
            <p className="font-body font-body-medium text-sm text-ink-muted mb-6">
              A runtime error occurred. Your session has been cleared.
            </p>
            {this.state.error && (
              <details className="text-left mb-4 p-3 bg-border-muted rounded font-mono font-mono-medium text-xs text-ink-muted">
                <summary className="cursor-pointer font-body font-body-semibold text-sm text-ink">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto max-h-40">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="btn-primary w-full"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;