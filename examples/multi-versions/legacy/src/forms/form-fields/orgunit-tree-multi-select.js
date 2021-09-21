import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';

import OrgUnitTree from 'd2-ui/lib/org-unit-tree/OrgUnitTreeMultipleRoots.component';
import OrgUnitSelectByLevel from 'd2-ui/lib/org-unit-select/OrgUnitSelectByLevel.component';
import OrgUnitSelectByGroup from 'd2-ui/lib/org-unit-select/OrgUnitSelectByGroup.component';
import OrgUnitSelectAll from 'd2-ui/lib/org-unit-select/OrgUnitSelectAll.component';
import TextField from 'material-ui/TextField/TextField';

import Action from 'd2-ui/lib/action/Action';

const styles = {
    multiSelectWrapper: {
        position: 'relative',
        minWidth: 850,
    },
    selectAllWrapper: {
        marginTop: 16,
    },
    controlStyles: {
        width: 475,
        zIndex: 1,
        background: 'white',
        marginLeft: '1rem',
        marginTop: '1rem',
        display: 'inline-block',
    },
    controlOverlayStyles: {
        position: 'absolute',
        width: 495,
        height: 240,
        marginLeft: -10,
        marginTop: 4,
        backgroundColor: 'rgba(230,230,230,0.3)',
        zIndex: 2,
        borderRadius: 8,
    },
    currentRootStyle: {
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 2,
        margin: 4,
    },
    treeWrapperStyle: {
        minHeight: 300,
        maxHeight: 450,
        minWidth: 350,
        maxWidth: 480,
        overflow: 'auto',
        border: '1px solid #bdbdbd',
        borderRadius: 3,
        padding: 4,
        margin: '4px 0',
        display: 'inline-block',
        verticalAlign: 'top',
    },
};

export default class OrganisationUnitTreeMultiSelect extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            isLoading: true,
            searchValue: '',
            rootOrgUnits: [],
            selectedOrgUnits: [],
        };

        this.searchOrganisationUnits = Action.create('searchOrganisationUnits');
    }

    componentDidMount() {
        const d2 = this.context.d2;

        Promise.all([
            d2.currentUser.getOrganisationUnits({
                fields: 'id,path,displayName,children::isNotEmpty',
            }),
            d2.models.organisationUnitLevels.list({
                paging: false,
                fields: 'id,level,displayName',
                order: 'level:asc',
            }),
            d2.models.organisationUnitGroups.list({
                paging: false,
                fields: 'id,displayName',
            }),
        ])
            .then(([
                orgUnits,
                levels,
                groups,
            ]) => {
                const rootOrgUnits = orgUnits
                    .toArray()
                    .filter(ou => (new RegExp(`${this.state.searchValue}`)).test(ou.displayName));
                this.setState({
                    originalRoots: rootOrgUnits,
                    isLoading: false,
                    rootOrgUnits,
                    currentRoot: rootOrgUnits[0],
                    selectedOrgUnits: this.props.value.toArray().map(ou => ou.path),
                    orgUnitGroups: groups,
                    orgUnitLevels: levels,
                });
            });

        this.subscription = this.searchOrganisationUnits.map(action => action.data)
            .debounceTime(400)
            .map((searchValue) => {
                if (!searchValue.trim()) {
                    return Observable.of(this.state.originalRoots);
                }
                const organisationUnitRequest = this.context.d2.models.organisationUnits
                    .filter().on('displayName').ilike(searchValue)
                    // withinUserHierarchy makes the query only apply to the subtrees of the organisation units that are
                    // assigned to the current user
                    .list({
                        pageSize: 100,
                        fields: 'id,displayName,path,children::isNotEmpty',
                        withinUserHierarchy: true,
                    })
                    .then(modelCollection => modelCollection.toArray());

                return Observable.fromPromise(organisationUnitRequest);
            })
            .concatAll()
            .subscribe(models => this.setState({ rootOrgUnits: models }));
    }

    componentWillUnmount() {
        this.subscription && this.subscription.unsubscribe();
    }

    setSelection = (selectedOrgUnitPaths) => {
        const d2 = this.context.d2;

        const selectedOrgUnitIds = selectedOrgUnitPaths.map(path => path.substr(path.lastIndexOf('/') + 1));
        const modelOrgUnits = this.props.model.organisationUnits;
        const assigned = modelOrgUnits.toArray().map(ou => ou.id);

        const additions = selectedOrgUnitIds
            // Filter out already assigned ids
            .filter(id => !assigned.includes(id))
            // Add the rest
            .map(id => d2.models.organisationUnits.create({ id }));

        const deletions = assigned
            // Filter out ids that should be left in
            .filter(id => !selectedOrgUnitIds.includes(id))
            // Add the rest
            .map(id => d2.models.organisationUnits.create({ id }));

        additions.forEach((ou) => {
            modelOrgUnits.add(ou);
        });
        deletions.forEach((ou) => {
            modelOrgUnits.remove(ou);
        });

        this.setState({ selectedOrgUnits: selectedOrgUnitPaths });
    }

    handleClick = (event, orgUnit) => {
        if (this.state.selectedOrgUnits.includes(orgUnit.path)) {
            this.setState((state) => {
                state.selectedOrgUnits.splice(state.selectedOrgUnits.indexOf(orgUnit.path), 1);

                this.props.model.organisationUnits.remove(orgUnit);

                return { selectedOrgUnits: state.selectedOrgUnits };
            });
        } else {
            this.setState((state) => {
                state.selectedOrgUnits.push(orgUnit.path);

                this.props.model.organisationUnits.add(orgUnit);

                return { selectedOrgUnits: state.selectedOrgUnits };
            });
        }
    }

    renderOrganisationUnitTree() {
        return (
            <div style={styles.treeWrapperStyle}>
                {this.state.rootOrgUnits.length
                    ? this.state.rootOrgUnits.map(rootOu => (
                        <OrgUnitTree
                            key={rootOu.id}
                            root={rootOu}
                            selected={this.state.selectedOrgUnits}
                            onSelectClick={this.handleClick}
                            currentRoot={this.state.currentRoot}
                            onChangeCurrentRoot={currentRoot => this.setState({ currentRoot })}
                            initiallyExpanded={[rootOu.path]}
                        />
                    ))
                    : (<div>{this.context.d2.i18n.getTranslation('no_roots_found')}</div>)
                }
            </div>
        );
    }

    renderSelectorButtons() {
        return (
            this.state.orgUnitGroups && this.state.orgUnitLevels &&
            <div style={styles.controlStyles} >
                {this.state.currentRoot
                    ? (
                        <span>{this.context.d2.i18n.getTranslation('for_organisation_units_within')}
                            <span style={styles.currentRootStyle}>{this.state.currentRoot.displayName}</span>
                        </span>
                    ) : (
                        <span>{this.context.d2.i18n.getTranslation('select_a_parent_organisation_unit')}</span>
                    )
                }
                <div style={this.state.currentRoot ? {} : styles.controlOverlayStyles} />
                <OrgUnitSelectByLevel
                    levels={this.state.orgUnitLevels}
                    selected={this.state.selectedOrgUnits}
                    currentRoot={this.state.currentRoot}
                    onUpdateSelection={this.setSelection}
                />
                <OrgUnitSelectByGroup
                    groups={this.state.orgUnitGroups}
                    selected={this.state.selectedOrgUnits}
                    currentRoot={this.state.currentRoot}
                    onUpdateSelection={this.setSelection}
                />
                <div style={styles.selectAllWrapper}>
                    <OrgUnitSelectAll
                        selected={this.state.selectedOrgUnits}
                        currentRoot={this.state.currentRoot}
                        onUpdateSelection={this.setSelection}
                    />
                </div>
            </div>
        );
    }

    render() {
        if (this.state.isLoading) {
            return (<div>{this.context.d2.i18n.getTranslation('determining_your_root_orgunits')}</div>);
        }
        return (
            <div style={styles.multiSelectWrapper}>
                <TextField
                    onChange={event => this.searchOrganisationUnits(event.target.value)}
                    floatingLabelText={this.context.d2.i18n.getTranslation('filter_organisation_units_by_name')}
                    fullWidth
                />
                <div className="organisation-unit-tree__selected">
                    {this.state.selectedOrgUnits.length} {this.context.d2.i18n.getTranslation('organisation_units_selected')}
                </div>
                {this.renderOrganisationUnitTree()}
                {this.renderSelectorButtons()}
            </div>
        );
    }
}

OrganisationUnitTreeMultiSelect.contextTypes = {
    d2: React.PropTypes.object.isRequired,
};
OrganisationUnitTreeMultiSelect.propTypes = {
    model: PropTypes.object.isRequired,
    value: React.PropTypes.object,
};
OrganisationUnitTreeMultiSelect.defaultProps = {
    value: [],
};
