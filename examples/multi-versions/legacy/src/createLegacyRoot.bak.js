/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/jsx-pascal-case */

import React from 'react';
import ReactDOM from 'react-dom';

// Note: this is a semi-private API, but it's ok to use it
// if we never inspect the values, and only pass them through.
// import {__RouterContext} from 'react-router';

// Pass through every context required by this tree.
// The context object is populated in src/modern/withLegacyRoot.
function Bridge({children, context}) {
  return <>{children}</>

  // return (
  //   <__RouterContext.Provider value={context.router}>
  //     {/*
  //       If we used the newer react-redux@7.x in the legacy/package.json,
  //       we would instead import {ReactReduxContext} from 'react-redux'
  //       and render <ReactReduxContext.Provider value={context.reactRedux}>.
  //     */}
  //     {children}
  //   </__RouterContext.Provider>
  // );
}

export default function createLegacyRoot(container) {
  return {
    render(Component, props, context) {
      ReactDOM.render(
        <Bridge context={context}>
          <Component {...props} />
        </Bridge>,
        container
      );
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
