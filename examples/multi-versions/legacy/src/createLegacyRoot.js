/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import ReactDOM from 'react-dom';
import {__RouterContext} from 'react-router'

function Bridge({children, context}) {
  return (
    <__RouterContext.Provider value={context.router}>
      {children}
    </__RouterContext.Provider>
  );
}

const unmount = container => ReactDOM.unmountComponentAtNode(container)
const render = (container, Component, props, context) => {
  ReactDOM.render(
    <Bridge context={context}>
      <Component {...props} />
    </Bridge>,
    container
  )
}

export default function createLegacyRoot(container) {
  return {
    render: (...args) => render(container, ...args),
    unmount: () => unmount(container),
  };
}
