import React, { Component } from 'react';
import withD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import wrapDisplayName from 'recompose/wrapDisplayName';
import { memoize } from 'lodash/fp';

class Empty extends Component {
    render() {
        return null;
    }
}

export default memoize(function switchOnBoolean(predicate, WhenTrue, WhenFalse = Empty) {
    const switchedComponent = (props, context) => predicate(props, context) ? <WhenTrue d2={context.d2} {...props} /> : <WhenFalse d2={context.d2} {...props} />;

    switchedComponent.displayName = wrapDisplayName(WhenTrue, switchOnBoolean.name);

    return withD2Context(switchedComponent);
});
