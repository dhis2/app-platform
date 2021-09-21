import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import App from './App';

console.log('> React.version (modern/index.js)', React.version)

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
