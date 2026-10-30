import { Component, type ErrorInfo, type ReactNode } from 'react';
type Props = { children: ReactNode; moduleName: string };
type State = { failed: boolean };

/** Isolates module rendering failures; error details are not logged because they may contain record data. */
export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A future server-side observability adapter may record a redacted event.
  }
  render() {
    if (this.state.failed) return (
      <section className="panel" role="alert" aria-live="assertive">
        <div className="panel-body">
          <h2>This section could not be opened</h2>
          <p>{this.props.moduleName} encountered an unexpected display error. Your other VidyaDesk sections remain available.</p>
          <button type="button" onClick={() => this.setState({ failed: false })}>Try again</button>
        </div>
      </section>
    );
    return this.props.children;
  }
}
