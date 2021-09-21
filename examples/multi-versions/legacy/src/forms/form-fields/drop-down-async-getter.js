import React from 'react';
import DropDown from './drop-down';
import { isNil } from 'lodash/fp';

class DropDownAsyncGetter extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.d2 = context.d2; // Doubles as promise callback cancel hack (see componentWillUnmount)

        this.state = {
            options: [],
        };

        this.getOptions = this.getOptions.bind(this);

        if (props.model) {
            this.getOptions(props.model);
        }
    }

    componentWillReceiveProps(newProps) {

        this.getOptions(newProps.model);
    }

    componentWillUnmount() {
        delete this.d2;
    }

    async getOptions(programId) {
        const options = await this.props.getter(programId, this.d2);

        if (this.d2) {
            this.setState({ options });
        }
    }

    render() {
        const { getter, shouldRender, useValueDotId, ...props } = this.props;       

        if (shouldRender(this.props.model)) {
            const eventIdWrapper = (event) => {
                if (!isNil(event.target.value)) {
                    if (useValueDotId) {
                        this.props.onChange({ target: { value: { id: event.target.value } } });
                    } else {
                        this.props.onChange({ target: { value: event.target.value } });
                    }
                } else {
                    this.props.onChange({ target: { value: null } });
                }
            };

            return (
                <DropDown
                    {...props}
                    value={useValueDotId ? this.props.value && this.props.value.id : this.props.value}
                    onChange={eventIdWrapper}
                    options={this.state.options}
                />
            );
        }

        return null;
    }
}

DropDownAsyncGetter.contextTypes = { d2: React.PropTypes.any };
DropDownAsyncGetter.propTypes = Object.assign({
    getter: React.PropTypes.func.isRequired,
    shouldRender: React.PropTypes.func.isRequired,
    useValueDotId: React.PropTypes.bool,
}, DropDown.propTypes);

DropDownAsyncGetter.defaultProps = {
    shouldRender: () => true,
    useValueDotId: true,
};

export default DropDownAsyncGetter;
