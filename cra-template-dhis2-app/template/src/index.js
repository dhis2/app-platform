import Shell from '@dhis2/app-shell'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.js';
import 'typeface-roboto'

ReactDOM.render(
  <React.StrictMode>
    {/**
      * --> WARNING! <--
      * ================
      *
      * Do not use the `<Shell />` component in your app.
      * This file is purely for development purposes, the app will later be
      * wrapped with the dhis2's app-shell automatically
      */}
    <Shell>
      <App />
    </Shell>
  </React.StrictMode>,
  document.getElementById('dhis2-app-root')
);
