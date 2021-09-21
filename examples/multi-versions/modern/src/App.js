import './App.css'
import './css/index.js'
import { useConfig } from '@dhis2/app-runtime'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route } from 'react-router-dom'
import { modernizedRoutes } from 'shared'
import { AppWrapper, LegacyApp, routesToComponentsMapping } from './__refactoring'
import { Header } from './components'
import {
    getAppDataError,
    getAppLoading,
    getAppReady,
    loadAppData,
} from './redux'

const AppContent = () => {
  const config = useConfig()
  const dispatch = useDispatch()
  const appReady = useSelector(getAppReady)
  const appLoading = useSelector(getAppLoading)
  const appError = useSelector(getAppDataError)

  useEffect(() => {
      if (!appLoading && !appReady && !appError) {
          dispatch(loadAppData())
      }
  }, [appLoading, appReady, appError, dispatch])

  if (appError) {
      return appError.toString()
  }

  if (!appReady) {
      return 'Loading...'
  }

  return (
    <>
      <Header />

      {modernizedRoutes.map(({ path }) => {
        const component = routesToComponentsMapping[path]
        return <Route key={path} path={path} component={component} />
      })}

      <LegacyApp {...config} />
    </>
  )
}

export default function App() {
  return (
    <AppWrapper>
      <AppContent />
    </AppWrapper>
  )
}
