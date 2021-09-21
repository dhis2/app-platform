import React from 'react';
import { getInstance } from 'd2/lib/d2';
import CircularProgress from 'd2-ui/lib/circular-progress/CircularProgress';

import DropDown from '../../forms/form-fields/drop-down';
import store from './dataElementGroupsStore';

function getLoadingdataElement() {
    return (
        <div style={{ textAlign: 'center' }}>
            <CircularProgress />
        </div>
    );
}

function findValue(optionList, model) {
    return optionList
        .map(option => option.value)
        .find(option => Array.from(model.dataElementGroups.values()).map(dataElementGroup => dataElementGroup.id).indexOf(option) !== -1);
}

export default React.createClass({
    propTypes: {
        source: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        store.setState({
            dataElementGroupValues: {},
            remove: [],
            save: [],
        });

        return {
            dataElementGroupSets: null,
        };
    },

    componentDidMount() {
        getInstance()
            .then(d2 => d2.Api.getApi().get('dataElementGroupSets', {
                fields: 'id,displayName,dataElementGroups[id,displayName]',
                filter: ['compulsory:eq:true'],
                paging: false,
            }))
            .then(response => response.dataElementGroupSets)
            .then(dataElementGroupSets => this.setState({ dataElementGroupSets }));

        this.subscription = store.subscribe(() => this.forceUpdate());
    },

    componentWillUnmount() {
        if (this.subscription && this.subscription.unsubscribe) {
            this.subscription.unsubscribe();
        }
    },

    _updateGroupStatus(dataElementGroupSetId, oldValue, event) {
        // TODO: Very bad to change props and set d2.model.dirty manually
        this.props.source.dirty = true;

        store.setState({
            dataElementGroupValues: Object.assign({}, store.state.dataElementGroupValues, { [dataElementGroupSetId]: event.target.value ? event.target.value : null }),
            remove: Array.from((new Set(store.state.remove.concat([oldValue])).values())),
        });
    },

    render() {
        if (!this.state.dataElementGroupSets) {
            return getLoadingdataElement();
        }

        return (
            <div>
                {this.state.dataElementGroupSets.map((dataElementGroupSet) => {
                    const optionList = dataElementGroupSet.dataElementGroups.map(ig => ({
                        value: ig.id,
                        text: ig.displayName,
                    }));

                    const value = Object.prototype.hasOwnProperty.call(store.state.dataElementGroupValues, dataElementGroupSet.id) ? store.state.dataElementGroupValues[dataElementGroupSet.id] : findValue(optionList, this.props.source);

                    return (
                        <div key={dataElementGroupSet.id}>
                            <DropDown
                                labelText={dataElementGroupSet.displayName}
                                translateLabel={false}
                                options={optionList}
                                value={value}
                                onChange={this._updateGroupStatus.bind(this, dataElementGroupSet.id, findValue(optionList, this.props.source))}
                                fullWidth
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
});
