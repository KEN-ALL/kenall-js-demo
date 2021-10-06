import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import App from './App';
import './index.css';
import { BrowserConfigContext } from './context';

const baseUrl = process.env.REACT_APP_BASE_URL || '/';

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
        false
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

ReactDOM.render(<Root />, document.getElementById('root'));
