import React from 'react';
import Paper from 'material-ui/Paper/Paper';
import OrganisationUnitTreeWithSingleSelectionAndSearch from '../OrganisationUnitTree/OrganisationUnitTreeWithSingleSelectionAndSearch.component';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import { setAppState, default as appState } from '../App/appStateStore';
import Action from 'd2-ui/lib/action/Action';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import addD2Context from 'd2-ui/lib/component-helpers/addD2Context';
import { getInstance } from 'd2/lib/d2';
import { Observable } from 'rxjs';
import snackActions from '../Snackbar/snack.actions';
import Heading from 'd2-ui/lib/headings/Heading.component';
import searchForOrganisationUnitsWithinHierarchy from './searchForOrganisationUnitsWithinHierarchy';
import log from 'loglevel';
import FontIcon from 'material-ui/FontIcon/FontIcon';
import AccessDenied from '../App/AccessDenied.component';

function identity(v) {
    return v;
}

const d2$ = Observable.fromPromise(getInstance());

const hierarchy$ = appState
    .map(state => state.hierarchy || {});

const rightTreeSearch = Action.create('rightTreeSearch', 'Hierarchy');
const leftTreeSearch = Action.create('leftTreeSearch', 'Hierarchy');

Observable
    // Merge the search action streams for the left and right side trees as we handle them the same
    .merge(
        leftTreeSearch
            .map(action => ({ ...action, side: 'left' }))
            .debounceTime(400),
        rightTreeSearch
            .map(action => ({ ...action, side: 'right' }))
            .debounceTime(400)
    )
    // Only search when we have values
    .filter(action => action.data)
    // Do the actual search
    .map(({ complete, error, data, side }) => Observable
        .fromPromise(searchForOrganisationUnitsWithinHierarchy(data, 50))
        .map(organisationUnits => ({ complete, error, organisationUnits, side }))
    )
    // Make sure we only take the latest
    .concatAll()
    // Grab the current state from the appState
    .flatMap(v => Observable
        .of(v)
        .combineLatest(hierarchy$.take(1), (result, hierarchy) => ({ result, hierarchy }))
    )
    // Update the app state with the result
    .subscribe(({ result, hierarchy }) => {
        setAppState({
            hierarchy: {
                ...appState.state.hierarchy,
                [`${result.side}Roots`]: result.organisationUnits,
            },
        });
    });

// Reset the trees to the userOrganisationUnits when no search value was found
Observable
    .merge(
        // Emit for the empty left searchfield
        leftTreeSearch
            .filter(action => !action.data)
            .map(() => 'left'),
        // Emit for the empty right searchfield
        rightTreeSearch
            .filter(action => !action.data)
            .map(() => 'right')
    )
    .flatMap(side => appState
        .take(1)
        .map(state => ({ side, state }))
    )
    .subscribe(({ side, state }) => {
        setAppState({
            hierarchy: {
                ...state.hierarchy,
                // Reset the roots of the left or right tree to the original root(s)
                [`${side}Roots`]: state.userOrganisationUnits.toArray(),
            },
        });
    });

const organisationUnitHierarchy$ = appState
    .map(({ hierarchy = {}, userOrganisationUnits }) => ({
        roots: userOrganisationUnits.toArray(),
        leftRoots: hierarchy.leftRoots,
        rightRoots: hierarchy.rightRoots,
        initiallyExpanded: userOrganisationUnits.toArray().map(model => model.path),
        moveTargetPath: hierarchy.moveTargetPath || null,
        selectedLeft: hierarchy.selectedLeft || [],
        selectedRight: hierarchy.selectedRight || [],
        isProcessing: hierarchy.isProcessing,
        reload: hierarchy.reload,
    }));

function onClickLeft(event, model) {
    hierarchy$
        .take(1) // Only grab the current state
        .subscribe(
            (hierarchy) => {
                const selectAllChildren = event.shiftKey

                let selectedLeft = [];

                let modelIdsToRemove = hierarchy.selectedLeft
                    .filter(m => m.id === model.id).map(m => m.id)

                const children = model.children.toArray()
                let childrenToAdd = []

                // add all children that is not already selected if shift-clicked
                if(selectAllChildren) {
                    childrenToAdd = children.filter(
                        (child) => hierarchy.selectedLeft.findIndex((m) => m.id === child.id) < 0
                    );
                }

                // remove selection if already present
                if (modelIdsToRemove.length > 0) {
                    if(selectAllChildren) {
                        modelIdsToRemove.push(...children.map(child => child.id))
                    }
                    selectedLeft = hierarchy.selectedLeft.filter(m => modelIdsToRemove.indexOf(m.id) < 0)
                } else {
                    selectedLeft = hierarchy.selectedLeft.concat(model, ...childrenToAdd);
                }

                setAppState({
                    hierarchy: {
                        ...hierarchy,
                        reload: [],
                        selectedLeft,
                    },
                });
            }
        );
}

async function getOrganisationUnitByIds(ids) {
    const d2 = await getInstance();

    const organisationUnits = await d2.models.organisationUnit
        .list({ filter: [`id:in:[${ids.join(',')}]`], fields: ':owner,href,id,parent,displayName,path,children[id,displayName,path]', paging: false });

    return organisationUnits.toArray();
}

function setHierarchyProcessingStatus(hierarchy, status) {
    setAppState({
        hierarchy: {
            ...hierarchy,
            isProcessing: status,
        },
    });
}

function changeOrganisationUnitParentAndSave(organisationUnit) {
    return hierarchy$
        .take(1)
        .combineLatest(d2$)
        .flatMap(([hierarchy, d2]) => {
            organisationUnit.parent = { id: hierarchy.selectedRight[0] && hierarchy.selectedRight[0].id };

            const movingStatus = organisationUnit
                .save()
                .then(() => d2.i18n.getTranslation('successfully_moved_$$ouName$$', { ouName: organisationUnit.displayName }))
                .catch(e => d2.i18n.getTranslation('failed_to_move_$$ouName$$_($$errorMessage$$)', {
                    ouName: organisationUnit.displayName,
                    errorMessage: e,
                }));

            return Observable.fromPromise(movingStatus);
        });
}

function moveOrganisationUnit() {
    hierarchy$
        .take(1)
        .do(hierarchy => setHierarchyProcessingStatus(hierarchy, true))
        .map(hierarchy => (hierarchy.selectedLeft || []).map(model => model.id))
        .flatMap(ouIds => Observable
            .fromPromise(getOrganisationUnitByIds(ouIds))
            .flatMap(identity)
        )
        .map(changeOrganisationUnitParentAndSave)
        .concatAll()
        .subscribe(
            (message) => {
                snackActions.show({ message, translate: false });
            },
            (e) => {
                setHierarchyProcessingStatus(appState.state.hierarchy, false);
            },
            () => {
                setAppState({
                    hierarchy: {
                        ...appState.state.hierarchy,
                        selectedLeft: [],
                        selectedRight: [],
                        initiallySelected: [],
                        moveTargetPath: appState.state.hierarchy.selectedRight[0].path,
                        reload: []
                            .concat(appState.state.hierarchy.selectedRight.map(model => model.id))
                            .concat(appState.state.hierarchy.selectedLeft.map((model) => {
                                if (model.parent && model.parent.id) {
                                    return model.parent.id;
                                }
                                return appState.state.hierarchy.leftRoots
                                    .concat(appState.state.hierarchy.rightRoots)
                                    .map(value => value.id)
                                    .filter(rootId => new RegExp(rootId).test(model.path))
                                    .reduce(value => value)
                            })),
                    },
                });

                // Wait till stack clears before setting isProcessing to false and triggering a rerender
                // Without this the UI represents a stale state
                setTimeout(() => {
                    setHierarchyProcessingStatus(appState.state.hierarchy, false)
                }, 0);
            }
        );
}

function onClickRight(event, model) {
    hierarchy$
        .take(1) // Only grab the current state
        .subscribe(
            hierarchy => setAppState({
                hierarchy: {
                    ...hierarchy,
                    reload: [],
                    selectedRight: [model],
                    moveTargetPath: null,
                },
            })
        );
}

function SelectedOrganisationUnitList(props, context) {
    const styles = {
        title: {
            color: '#666',
            marginBottom: '.5rem',
        },
        message: {
            color: '#666',
            padding: '.5rem',
            display: 'block',
        },
        list: {
            paddingLeft: '1.5rem',
        },
    };

    const listItems = props.organisationUnits
        .map(model => <li key={model.id}>{model.displayName}</li>);

    const noOrganisationUnitsMessage = (
        <span style={styles.message}>{context.d2.i18n.getTranslation(props.noOrganisationUnitsMessage)}</span>
    );

    return (
        <div style={props.style}>
            <div style={styles.title}>{context.d2.i18n.getTranslation(props.title)}</div>
            {listItems.length ? <ul style={styles.list}>{listItems}</ul> : noOrganisationUnitsMessage}
        </div>
    );
}
SelectedOrganisationUnitList.defaultProps = {
    organisationUnits: [],
};

const SelectedOrganisationUnitListWithContext = addD2Context(SelectedOrganisationUnitList);

function hasEqualElement(left, right, selector) {
    return left.map(selector).some(item => right.map(selector).indexOf(item) >= 0);
}

function splitOuPath(path = '') {
    return path
        .split('/')
        .filter(part => part);
}

function sourceIsInPathOfTarget(source, target) {
    if (source.some(model => !model.path) || target.some(model => !model.path)) {
        log.warn('No path found, so can not run hierarchy validation');
        return true;
    }

    if (target.length !== 1) {
        log.warn('More than/less than 1 target found, can not move.');
        return true;
    }

    const targetModel = target[0];

    return source.some(sourceModel => splitOuPath(targetModel.path).indexOf(sourceModel.id) >= 0);
}

function moveButtonDisabled(props) {
    return props.isProcessing ||
        !props.selectedLeft.length ||
        !props.selectedRight.length ||
        hasEqualElement(props.selectedLeft, props.selectedRight, v => v && v.id) ||
        sourceIsInPathOfTarget(props.selectedLeft, props.selectedRight);
}

function OrganisationUnitHierarchy(props, context) {
    const styles = {
        wrap: {
            flex: 1,
            display: 'flex',
            flexOrientation: 'row',
            margin: '1rem 0',
        },
        ouTreeLeft: {
            flex: 1,
            marginRight: '2rem',
            padding: '1rem',
        },
        ouTreeRight: {
            flex: 1,
            padding: '1rem',
        },
        moveButton: {
            width: '100%',
            marginBottom: '1rem',
            marginTop: '1rem',
        },
        pendingOperationsWrap: {
            padding: '1rem',
            margin: '1rem 0',
        },
        pendingOperationsListsWrap: {
            display: 'flex',
            flexDirection: 'row',
        },
        pendingOperationsList: {
            flex: 1,
            padding: '.5rem',
        },
        errorMessage: {
            color: 'orange',
            lineHeight: '1.5rem',
            padding: '1rem 0',
            display: 'flex',
            alignItems: 'flex-end',
        },
        errorIcon: {
            color: 'orange',
        },
    };

    if (!context.d2.currentUser.authorities.has('F_ORGANISATIONUNIT_MOVE')) {
        return (
            <AccessDenied />
        );
    }

    const buttonLabel = context.d2.i18n.getTranslation('move_$$ouCount$$_organisation_units', { ouCount: (props.selectedLeft && props.selectedLeft.length) || 0 });
    const headingTitle = context.d2.i18n.getTranslation('hierarchy_operations');
    const warningForMovingWithinSubtree = context.d2.i18n.getTranslation('you_can_not_move_higher_level_organisation_units_to_its_descendants');
    const initiallyExpandedRight = props.moveTargetPath ? [...props.initiallyExpanded, props.moveTargetPath] : props.initiallyExpanded;

    return (
        <div>
            <Heading>{headingTitle}</Heading>
            <div style={styles.wrap}>
                <Paper style={styles.ouTreeLeft}>
                    <OrganisationUnitTreeWithSingleSelectionAndSearch
                        roots={props.leftRoots}
                        initiallyExpanded={props.initiallyExpanded}
                        selected={props.selectedLeft.map(model => model.path)}
                        onSelectClick={onClickLeft}
                        onUpdateInput={value => leftTreeSearch(value)}
                        idsThatShouldBeReloaded={props.reload}
                        noHitsLabel={context.d2.i18n.getTranslation('no_matching_organisation_units')}
                        forceReloadChildren
                    />
                </Paper>
                <Paper style={styles.ouTreeRight}>
                    <OrganisationUnitTreeWithSingleSelectionAndSearch
                        roots={props.rightRoots}
                        selected={props.selectedRight.map(model => model.path)}
                        initiallyExpanded={initiallyExpandedRight}
                        onSelectClick={onClickRight}
                        onUpdateInput={value => rightTreeSearch(value)}
                        idsThatShouldBeReloaded={props.reload}
                        noHitsLabel={context.d2.i18n.getTranslation('no_matching_organisation_units')}
                        hideCheckboxes
                        hideMemberCount
                        forceReloadChildren
                    />
                </Paper>
            </div>
            <Paper style={styles.pendingOperationsWrap}>
                <div style={styles.pendingOperationsListsWrap}>
                    <SelectedOrganisationUnitListWithContext
                        style={styles.pendingOperationsList}
                        organisationUnits={props.selectedLeft}
                        noOrganisationUnitsMessage="select_organisation_units_to_move_from_the_left_tree"
                        title="move"
                    />
                    <SelectedOrganisationUnitListWithContext
                        style={styles.pendingOperationsList}
                        organisationUnits={props.selectedRight}
                        noOrganisationUnitsMessage="select_new_parent_for_organisation_units_from_the_right_tree"
                        title="new_parent"
                    />
                </div>
            </Paper>
            {props.selectedLeft.length && props.selectedRight.length && sourceIsInPathOfTarget(props.selectedLeft || [], props.selectedRight || []) ? <div style={styles.errorMessage}><FontIcon style={styles.errorIcon} className="material-icons">warning</FontIcon>{warningForMovingWithinSubtree}</div> : null}
            <RaisedButton
                primary
                style={styles.moveButton}
                label={buttonLabel}
                onClick={moveOrganisationUnit}
                disabled={moveButtonDisabled(props)}
            />
        </div>
    );
}
OrganisationUnitHierarchy.defaultProps = {
    selectedLeft: [],
    selectedRight: [],
};

export default withStateFrom(organisationUnitHierarchy$, addD2Context(OrganisationUnitHierarchy));
