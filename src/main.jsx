import React from 'react';
import { createRoot } from 'react-dom/client';
import EVTracker from '../js/tracker.jsx';
import '../style.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: String(error) };
  }
  componentDidCatch(error, info) {
    console.error('Render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#ff6b6b', padding: '20px', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace', fontSize: '13px' }}>
          <div style={{ marginBottom: '12px', color: '#f5a623' }}>⚠ レンダリングエラー</div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary><EVTracker /></ErrorBoundary>
);
