import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import Paper from 'material-ui/Paper/Paper';

import DetailsBox from './DetailsBox.component';

class DetailsBoxWithScroll extends Component {
    componentDidMount() {
        this.subscription = Observable
            .fromEvent(global, 'scroll')
            .debounceTime(200)
            .map(() => document.querySelector('body').scrollTop)
            .subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.subscription && this.subscription.unsubscribe();
    }

    render() {
        const paperStyle = { maxWidth: 500, minWidth: 300, marginTop: document.querySelector('body').scrollTop };

        return (
            <div style={this.props.style}>
                <Paper zDepth={1} rounded={false} style={paperStyle}>
                    <DetailsBox
                        source={this.props.detailsObject}
                        showDetailBox={!!this.props.detailsObject}
                        onClose={this.props.onClose}
                    />
                </Paper>
            </div>
        );
    }
}

DetailsBoxWithScroll.propTypes = {
    style: PropTypes.object,
    detailsObject: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

DetailsBoxWithScroll.defaultProps = {
    style: {},
};

export default DetailsBoxWithScroll;
