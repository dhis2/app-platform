import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ErrorMessage from 'd2-ui/lib/messages/ErrorMessage.component';

import modelToEditStore from '../../EditModel/modelToEditStore';
import LoadableComponent from '../../utils/LoadableComponent';


const LoadableLegendComponent = LoadableComponent({ loader: () => import('d2-ui/lib/legend/Legend.component') });

class LegendsField extends Component {
    updateLegends = (newLegends) => {
        const model = modelToEditStore.getState();
        model[this.props.referenceProperty] = newLegends;

        this.props.onChange({
            target: {
                value: model[this.props.referenceProperty],
            },
        });
    }

    render() {
        const legends = this.props.value;

        return (
            <div>
                <LoadableLegendComponent items={legends} onItemsChange={this.updateLegends} />
                <ErrorMessage message={this.props.errorText} />
            </div>
        );
    }
}

LegendsField.propTypes = {
    referenceProperty: PropTypes.string.isRequired,
    errorText: PropTypes.string,
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
};

LegendsField.defaultProps = {
    value: [],
    errorText: '',
};


export default new Map([
    ['legends', {
        component: LegendsField,
        validators: [
            {
                message: 'overlapping_legends_not_allowed',
                validator(value) {
                    return Array.from(value.values()).every((legend, index, legends) => {
                        const nextLegend = legends[index + 1];

                        if (!nextLegend) {
                            return true;
                        }

                        const currentEnd = Number(legend.endValue);
                        const nextStart = Number(nextLegend.startValue);

                        // Same values are allowed, but currentEnd can not be bigger than nextStart
                        return currentEnd <= nextStart;
                    });
                },
            },
            {
                message: 'Gaps_in_the_legends_are_not_allowed',
                validator(value) {
                    return Array.from(value.values()).every((legend, index, legends) => {
                        const nextLegend = legends[index + 1];

                        if (!nextLegend) {
                            return true;
                        }

                        return Number(legend.endValue) >= Number(nextLegend.startValue);
                    });
                },
            },
        ],
    }],
]);
