import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DropdownAsync from '../../forms/form-fields/drop-down-async';
import LoadingMask from '../../loading-mask/LoadingMask.component';
import CircularProgress from 'd2-ui/lib/circular-progress/CircularProgress';
import has from 'lodash/fp/has';

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE';
const PROGRAM_INSTANCE = 'PROGRAM_INSTANCE';
const PROGRAM_STAGE_INSTANCE = 'PROGRAM_STAGE_INSTANCE';

const relationshipEntities = {
    [TRACKED_ENTITY_INSTANCE]: 'tracked_entity_instance',
    [PROGRAM_INSTANCE]: 'enrollment_in_program',
    [PROGRAM_STAGE_INSTANCE]: 'event_in_program_or_program_stage',
};
//PROGRAMSTAGE INSTANCE: Event in program stage
//Program instance: Enrollment in program

// Map of the different valid selection of the embedded objects, according to selected constraint-type
const modelTypesForRelationshipEntity = {
    TRACKED_ENTITY_INSTANCE: [
        {
            modelType: 'trackedEntityType',
            required: true,
            mutex: true, // Used to clear program when selected
        },
        {
            modelType: 'program',
            required: false,
            filter: (props, state) => {
                return [
                    'programType:eq:WITH_REGISTRATION',
                    `trackedEntityType.id:eq:${
                        state.selected.trackedEntityType.id
                    }`,
                ];
            },
        },
    ],
    PROGRAM_INSTANCE: [
        {
            modelType: 'program',
            required: true,
            filter: ['programType:eq:WITH_REGISTRATION'],
        },
    ],
    PROGRAM_STAGE_INSTANCE: [
        {
            modelType: 'program',
            mutex: 'programStage',
            required: true,
        },
        {
            modelType: 'programStage', //This is only used for Tracker-programs
            mutex: 'program',
            required: false,
            filter: (props, state) => {
                return [`program.id:eq:${state.selected.program.id}`];
            },
        },
    ],
};

const styles = {
    modelTypeWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'top',
        marginBottom: '16px',
        paddingLeft: '8px',
        paddingRight: '8px',
        borderStyle: 'none none none solid',
        borderWidth: '1px',
        borderColor: 'rgb(189, 189, 189)',
    },
    modelTypeSelectField: {
        flex: '1 1 300px',
        marginRight: '14px',
        position: 'relative',
    },
};

class Constraint extends Component {
    constructor(props, context) {
        super(props);
        this.d2 = context.d2;
        this.translate = this.d2.i18n.getTranslation.bind(context.d2.i18n);

        /* The value that should be posted to the API. Has a relationShipEntity (the selected) constraint.
            "TRACKED_ENTITY_INSTANCE" constraint has the following structure
                program: { id },
                relationshipEntity: "TRACKED_ENTITY_INSTANCE",
                trackedEntityType: { id }

        When Program Stage Instance is selected, we need to know the programType for selected programs, so we keep a reference to the model.
        We use the program-dropdown as a 'filter' (for trackerprograms) to only show programStages for the selected program,
        however we cannot post this value to the server together with a programStage, as that results in an error.
        If the selected program is a tracker-program, it should also be possible to further select a programStage
        to narrow down the relationship. However this is optional, and if its not selected, we just post the programID.
        Therefore we save the selected values in the state. */

        let selected = null;
        if (props.value && props.value.relationshipEntity) {
            const relationshipEntity = props.value.relationshipEntity;
            const modelTypes =
                modelTypesForRelationshipEntity[relationshipEntity];
            selected = {};
            modelTypes.forEach(objOpts => {
                const modelType = objOpts.modelType;
                if (props.value[modelType]) {
                    selected[modelType] = props.value[modelType];
                }
            });
        }

        this.state = {
            selected,
            loading: true,
            error: false,
        };
    }

    componentDidMount() {
        /* Since we cannot get the programId from the same request as when loading the model,
            (due to the nature of the dynamic structure of the relationShipConstraint object)
            we need to grab the programStage with another request, as we need this to show the
            program that the selected program stage belongs to. */
        const selectedPS =
            this.state.selected && this.state.selected.programStage;
        if (selectedPS) {
            this.fetchProgramForProgramStage(selectedPS.id)
                .then(programModel => {
                    this.setState(state => ({
                        selected: {
                            ...state.selected,
                            program: programModel,
                        },
                        loading: false,
                    }));
                })
                .catch(e => {
                    console.error(e);
                    this.setState({
                        error: e,
                    });
                });
        }
        this.setState({ loading: false });
    }

    getSelectedRelationshipEntity = () => {
        const props = this.props;
        return (props.value && props.value.relationshipEntity) || null;
    };

    getSelectedIDForModelType = modelType => {
        // We use state here, since program and programStage cannot be selected
        // at the same time (for the actual posted value). See constructor comment
        return (this.state.selected && this.state.selected[modelType]) || null;
    };

    fetchProgramForProgramStage = async programStageId => {
        const program = await this.d2.models.program
            .filter()
            .on('programStages.id')
            .equals(programStageId)
            .list({ paging: false, fields: ['id,displayName,programType'] });
        return program.toArray()[0];
    };

    getFilterForModelType(entityModelProps) {
        const filter = entityModelProps.filter;
        if (typeof filter === 'function') {
            return filter(this.props, this.state);
        } else if (Array.isArray(filter)) {
            return filter;
        }
        return null;
    }

    handleSelectRelationshipEntity = (_, __, value) => {
        this.setState({
            error: false,
            selected: null,
        });
        this.props.onChange({
            target: {
                value: {
                    relationshipEntity: value,
                },
            },
        });
    };

    handleSelectValue = (modelType, { target: { value } }) => {
        const selectedRelationshipEntity = this.getSelectedRelationshipEntity();
        const objOptions = modelTypesForRelationshipEntity[
            selectedRelationshipEntity
        ].find(obj => obj.modelType === modelType);

        let modelTypeValue = {
            id: (value && value.id) || null,
        };
        // Clear values if mutually exclusive
        let prevState = objOptions.mutex ? {} : this.props.value;
        const selectedProgram = this.getSelectedIDForModelType('program');
        if (modelType === 'programStage' && value === null && selectedProgram) {
            // If "no value is selected", we need to manually add the program as selected
            // and clear the programStage
            prevState = {
                ...prevState,
                program: {
                    id: selectedProgram.id,
                },
            };
            modelTypeValue = null;
        }

        const relationshipConstraint = {
            ...prevState,
            relationshipEntity: this.props.value.relationshipEntity,
            [modelType]: modelTypeValue,
        };
        this.props.onChange({
            target: {
                value: relationshipConstraint,
            },
        });

        // Keep reference in state to check for selected programType etc
        // Clear state when program changes
        const clearState =
            modelType === 'program' &&
            selectedRelationshipEntity === PROGRAM_STAGE_INSTANCE;

        this.setState(state => ({
            selected: {
                ...(!clearState && { ...state.selected }),
                [modelType]: value,
            },
        }));
    };

    hasSelectedTrackerProgram = () =>
        has('selected.program', this.state) &&
        this.state.selected.program.programType === 'WITH_REGISTRATION';

    handleOptionsLoaded = (modelType, options) => {
        // get reference to already selected constraint
        // ie when a saved model is edited, so we can check for programType
        if (!this.state.selected) return;
        const selectedModelID =
            this.state.selected[modelType] && this.state.selected[modelType].id;
        const option = options.find(opt => opt.value == selectedModelID);
        if (option) {
            this.setState(state => ({
                selected: {
                    ...state.selected,
                    [modelType]: option.model,
                },
            }));
        }
    };

    renderErrorOrLoading = () => {
        if (this.state.loading) {
            return (
                <div style={{ height: '72px' }}>
                    <CircularProgress />
                </div>
            );
        }
        if (this.state.error) {
            return (
                <div style={styles.modelTypeSelectField}>
                    Failed to load program for program stage.
                </div>
            );
        }
    };

    shouldRenderModelType = modelType => {
        const entity = this.getSelectedRelationshipEntity();
        if (
            entity === PROGRAM_STAGE_INSTANCE &&
            modelType === 'programStage' &&
            !this.hasSelectedTrackerProgram()
        ) {
            //Hide programStage selector when Tracker Program is not selected
            return false;
        } else if (
            entity === TRACKED_ENTITY_INSTANCE &&
            modelType === 'program' &&
            !has('selected.trackedEntityType.id', this.state)
        ) {
            //Hide program when tet is not selected
            return false;
        }
        return true;
    };

    renderModelTypeSelectFields = () => {
        if (this.state.loading || this.state.error) {
            return this.renderErrorOrLoading();
        }
        const entity = this.getSelectedRelationshipEntity();
        const modelTypes = modelTypesForRelationshipEntity[entity];

        // Create fields for the selected relationshipEntity
        const modelDropdowns = modelTypes.map(objOpts => {
            const modelType = objOpts.modelType;
            let value = this.getSelectedIDForModelType(modelType);

            if (!this.shouldRenderModelType(modelType)) {
                return null;
            }
            const filter = this.getFilterForModelType(objOpts);

            return (
                <div style={styles.modelTypeSelectField} key={modelType}>
                    <DropdownAsync
                        isRequired={objOpts.required}
                        labelText={`${this.translate(
                            camelCaseToUnderscores(modelType)
                        )} ${objOpts.required ? ' *' : ''}`}
                        value={value}
                        referenceType={modelType}
                        onChange={this.handleSelectValue.bind(this, modelType)}
                        onOptionsLoaded={this.handleOptionsLoaded}
                        queryParamFilter={filter}
                        orFilter={false}
                    />
                </div>
            );
        });

        return <div style={styles.modelTypeWrapper}>{modelDropdowns}</div>;
    };

    render = () => {
        return (
            <div>
                <SelectField
                    fullWidth
                    value={this.getSelectedRelationshipEntity()}
                    onChange={this.handleSelectRelationshipEntity}
                    floatingLabelText={this.props.labelText}
                >
                    {Object.keys(relationshipEntities).map(entity => (
                        <MenuItem
                            key={entity}
                            value={entity}
                            primaryText={this.translate(
                                relationshipEntities[entity]
                            )}
                        />
                    ))}
                </SelectField>
                {this.getSelectedRelationshipEntity() &&
                    this.renderModelTypeSelectFields()}
            </div>
        );
    };
}

Constraint.contextTypes = {
    d2: PropTypes.object,
};

export default new Map([
    [
        'fromConstraint',
        {
            component: Constraint,
            required: true,
            unique: false,
        },
    ],
    [
        'toConstraint',
        {
            component: Constraint,
            required: true,
            unique: false,
        },
    ],
]);
