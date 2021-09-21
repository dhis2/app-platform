import React from 'react';
import { getInstance } from 'd2/lib/d2';
import CircularProgress from 'd2-ui/lib/circular-progress/CircularProgress';

import DropDown from '../forms/form-fields/drop-down';
import store from './indicatorGroupsStore';

function getLoadingIndicator() {
    return (
        <div style={{ textAlign: 'center' }}>
            <CircularProgress />
        </div>
    );
}

function findValue(optionList, model) {
    return optionList
        .map(option => option.value)
        .find(option => Array.from(model.indicatorGroups.values()).map(indicatorGroup => indicatorGroup.id).indexOf(option) !== -1);
}

export default React.createClass({
    propTypes: {
        source: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        store.setState({
            indicatorGroupValues: {},
            remove: [],
            save: [],
        });

        return {
            indicatorGroupSets: null,
        };
    },

    componentDidMount() {
        getInstance()
            .then(d2 => d2.Api.getApi().get('indicatorGroupSets', {
                fields: 'id,displayName,indicatorGroups[id,displayName]',
                filter: ['compulsory:eq:true'],
                paging: false,
            }))
            .then(response => response.indicatorGroupSets)
            .then(indicatorGroupSets => this.setState({ indicatorGroupSets }));

        this.subscription = store.subscribe(() => this.forceUpdate());
    },

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription && this.subscription.unsubscribe();
        }
    },

    render() {
        if (!this.state.indicatorGroupSets) {
            return getLoadingIndicator();
        }

        return (
            <div>
                {this.state.indicatorGroupSets.map((indicatorGroupSet, key) => {
                    const optionList = indicatorGroupSet.indicatorGroups.map(ig => ({
                        value: ig.id,
                        text: ig.displayName,
                    }));

                    const value = Object.prototype.hasOwnProperty.call(store.state.indicatorGroupValues, indicatorGroupSet.id) ? store.state.indicatorGroupValues[indicatorGroupSet.id] : findValue(optionList, this.props.source);

                    return (
                        <div key={`dataIndicatorGroupAssignment${key}`}>
                            <DropDown
                                key={indicatorGroupSet.id}
                                labelText={indicatorGroupSet.displayName}
                                translateLabel={false}
                                options={optionList}
                                value={value}
                                onChange={this._updateGroupStatus.bind(this, indicatorGroupSet.id, findValue(optionList, this.props.source))}
                                fullWidth
                            />
                        </div>
                    );
                })}
            </div>
        );
    },

    _updateGroupStatus(indicatorGroupSetId, oldValue, event) {
        // TODO: Very bad to change props and set d2.model.dirty manually
        this.props.source.dirty = true;

        store.setState({
            indicatorGroupValues: Object.assign({}, store.state.indicatorGroupValues, { [indicatorGroupSetId]: event.target.value ? event.target.value : null }),
            remove: Array.from((new Set(store.state.remove.concat([oldValue])).values())),
        });
    },
});
