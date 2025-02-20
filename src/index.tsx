import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';
import App from './App';
import './index.css';
import { BrowserConfigContext } from './context';

const baseUrl = import.meta.env.VITE_BASE_URL || '/';

const Root: React.FunctionComponent = () => {
  const [_scrollbarWidth, setScrollbarWidth] = React.useState<number>(0);
  React.useEffect(() => {
    const w = scrollbarWidth();
    if (w === undefined) {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          setScrollbarWidth(scrollbarWidth() || 0);
        },
        false,
      );
    } else {
      setScrollbarWidth(w);
    }
  }, []);
  return (
    <React.StrictMode>
      <BrowserConfigContext.Provider
        value={{ scrollbarWidth: _scrollbarWidth }}
      >
        <Router basename={baseUrl}>
          <App />
        </Router>
      </BrowserConfigContext.Provider>
    </React.StrictMode>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
