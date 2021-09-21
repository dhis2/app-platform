import React from 'react';
import DropDown from './drop-down';
import periodTypeStore from '../../App/periodTypeStore';

class PeriodTypeDropDown extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            options: [],
        };
    }

    componentWillMount() {
        this.sub = periodTypeStore.subscribe((periodTypes) => {
            this.setState({ options: periodTypes });
        });
    }

    componentWillUnmount() {
        this.sub && this.sub.unsubscribe && this.sub.unsubscribe();
    }

    render() {
        return (
            <div style={this.props.style}>
                <DropDown {...this.props} options={this.state.options} />
            </div>
        );
    }
}

export default PeriodTypeDropDown;
