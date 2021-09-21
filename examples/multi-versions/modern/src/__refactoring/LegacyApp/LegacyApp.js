/* eslint-disable react/jsx-pascal-case */
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom'
import lazyLegacyRoot from './lazyLegacyRoot';

const Spinner = () => null
const _LegacyApp = lazyLegacyRoot(() => import('legacy').App)

export const LegacyApp = props => {
  return (
    <Suspense fallback={<Spinner />}>
      <Route render={() => <_LegacyApp {...props} />} />
    </Suspense>
  )
}
