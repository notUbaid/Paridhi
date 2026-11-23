import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { buttonClass } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[paridhi] Render error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="bg-surface rounded-lg border border-line p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-warn-soft text-warn flex items-center justify-center mx-auto border border-warn-line">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Something went wrong showing this plot</h2>
            <p className="text-sm text-muted mt-1">Your data is safe on the server. Reloading usually fixes this.</p>
            <div className="mt-3 p-2 bg-paper rounded-lg border border-line font-mono text-xs text-muted truncate text-left">
              {this.state.error.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={buttonClass('primary')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
        </div>
      </div>
    );
  }
}
