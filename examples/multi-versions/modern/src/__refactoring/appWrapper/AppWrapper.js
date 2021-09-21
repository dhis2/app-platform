import { Provider as RuntimeProvider, useDataEngine } from '@dhis2/app-runtime'
import React, { useMemo } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { Router } from 'react-router-dom'
import { history } from 'shared'
import { configureStore } from '../../redux'

const appConfig = {
    baseUrl: 'https://debug.dhis2.org/dev',
    apiVersion: 33,
}

const WithRedux = ({ children }) => {
  const engine = useDataEngine()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const store = useMemo(() => configureStore(engine), [])

  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  )
}

export const AppWrapper = ({ children }) => {
  return (
    <Router history={history}>
      <RuntimeProvider config={appConfig}>
        <WithRedux>
          {children}
        </WithRedux>
      </RuntimeProvider>
    </Router>
  );
}
