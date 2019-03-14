import React from 'react';

 // @ts-ignore
const D2App = React.lazy(() => import('./current-d2-app/App')); // Automatic bundle splitting!

const url = process.env.REACT_APP_DHIS2_BASE_URL;

const App = () => (
  <React.Suspense fallback={<div></div>}>
    <D2App config={{
      url
    }} />
  </React.Suspense>
);

export default App;