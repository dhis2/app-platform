import { Button } from '@dhis2/ui'
import React from 'react'

export const ViewDataElementList = ({ location }) => (
  <div style={{ padding: '121px 16px 16px' }}>
    Yeah, new route!!!
    <br />
    {location.pathname}
    <br />
    <br />
    <Button primary>I am a @dhis2/ui button!</Button>
  </div>
)
