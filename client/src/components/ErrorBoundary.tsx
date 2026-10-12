import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Top-level error boundary.
 * Catches any render-time throw below it and shows a friendly recovery UI
 * instead of a blank page. Logs the full error to the console so devs
 * can still see the stack.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{ background: 'var(--color-paper)' }}
        >
          <h1
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: 'var(--font-serif)',
              fontVariationSettings: "'opsz' 28",
              color: 'var(--color-ink)',
            }}
          >
            Something went wrong
          </h1>
          <p
            className="text-sm mb-6 max-w-sm"
            style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
          >
            {this.state.message}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--color-clay)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
            <Link
              to="/listings"
              className="px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                border: '1.5px solid var(--color-clay)',
                color: 'var(--color-clay)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              ← Back to listings
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
