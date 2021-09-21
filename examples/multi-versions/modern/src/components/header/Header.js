import { HeaderBar } from '@dhis2/ui'
import React from 'react'
import { Navigation } from '../navigation'

export const Header = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: 48, zIndex: 2 }}>
      <HeaderBar appName="Maintenance app" />
      <Navigation />
    </div>
  )
}
