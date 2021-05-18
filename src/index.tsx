import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

const baseUrl = process.env.REACT_APP_BASE_URL || '/';

ReactDOM.render(
  <React.StrictMode>
    <Router basename={baseUrl}>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
