import React from 'react';

 // @ts-ignore
const D2App = React.lazy(() => import('./current-d2-app/App')); // Automatic bundle splitting!

const App = () => (
  <React.Suspense fallback={<div></div>}>
    <D2App />
  </React.Suspense>
);

export default App;
