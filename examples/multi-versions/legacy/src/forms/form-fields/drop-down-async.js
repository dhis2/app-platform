import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getInstance } from 'd2/lib/d2';

import DropDown from './drop-down';
import QuickAddLink from './helpers/QuickAddLink.component';
import RefreshMask from './helpers/RefreshMask.component';
import isEqual from 'lodash/fp/isEqual';

const wrapStyles = {
    display: 'flex',
    alignItems: 'flex-end',
};

class DropDownAsync extends Component {
    state = {
        options: [],
        isRefreshing: false,
    }

    componentDidMount() {
        this.loadOptions();
    }

    // TODO: Remove this hack to update the categoryCombo property when the domainType is set to TRACKER
    // This should probably be done in the objectActions, however there we currently do not have any knowledge of the
    // options.. It might be worth loading the categoryOption with name `default` just for this.
    componentWillReceiveProps(newProps) {
        const defaultOption = this.state.options.find(option => option.model.name === 'default');

        if (newProps.value && defaultOption && defaultOption.model.id !== newProps.value.id &&
            this.props.model && this.props.model.domainType === 'TRACKER') {
            this.props.onChange({
                target: {
                    value: defaultOption.model,
                },
            });
        }

        // referenceType updated, reload
        // Deep equal queryParamFilter, as this may have a new reference each render.
        // Should not have that many elems.
        if (this.props.referenceType !== newProps.referenceType || !isEqual(newProps.queryParamFilter, this.props.queryParamFilter)) {
            this.onRefreshClick(null, newProps);
        }
    }

    componentWillUnmount() {
        this.omgLikeJustStop = true;
    }

    onRefreshClick = (e, props = this.props) => {
        this.setState({
            isRefreshing: true,
        });

        this.loadOptions(props)
            .then((opts) => {
                this.setState({ isRefreshing: false })
            });
    }

    onChange = (event) => {
        if (event.target.value === null) {
            this.props.onChange({
                target: {
                    value: null,
                },
            });
            return;
        }

        const option = this.state.options.find(opt => opt.model.id === event.target.value);
        if (option && option.model) {
            this.props.onChange({
                target: {
                    value: option.model,
                },
            });
        }
    }

    loadOptions(props = this.props) {
        let fieldsForReferenceType = 'id,displayName,name';

        // The valueType is required for optionSet so we can set the model valueType to the optionSet.valueType
        if (props.referenceType === 'optionSet') {
            fieldsForReferenceType = 'id,displayName,name,valueType';
        }

        // program.programType is required for programIndicators to be able to determine if it is a tracker or event program
        if (props.referenceType === 'program') {
            /*
             * DHIS-2444: program.programTrackedEntity is needed for the
             * attributeselector to work when changing programs.
             */

            fieldsForReferenceType = 'id,displayName,programType,programTrackedEntityAttributes[id,trackedEntityAttribute[id,displayName,valueType]]';
        }
        // Need trackedEntityAttribute-ids for trackerProgram to assign programTrackedEntityAttributes
        if (props.referenceType === 'trackedEntityType') {
            fieldsForReferenceType = fieldsForReferenceType
                .concat(',trackedEntityTypeAttributes[trackedEntityAttribute]');
        }

        const filter = props.queryParamFilter;
        let d2i = {};
        return getInstance()
            .then((d2) => {
                d2i = d2;
                if (d2.models.hasOwnProperty(props.referenceType)) {
                    return d2.models[props.referenceType].list(Object.assign(
                        {
                            fields: fieldsForReferenceType,
                            paging: false,
                            filter,
                        },
                        filter && props.orFilter && filter.length > 1
                            ? { rootJunction: 'OR' }
                            : {},
                    ));
                } else if (props.referenceType.indexOf('.') !== -1) {
                    const modelName = props.referenceType.substr(0, props.referenceType.indexOf('.'));
                    const modelProp = props.referenceType.substr(modelName.length + 1);
                    return d2.models[modelName].modelProperties[modelProp].constants
                        .map(v => ({ displayName: d2.i18n.getTranslation(v.toLowerCase()), id: v }));
                }
            })
            .then(modelCollection => (
                modelCollection
                    ? (modelCollection.toArray ? modelCollection.toArray() : modelCollection)
                    : []
            ))
            .then(values => values.map(model => ({
                text: model.displayName,
                value: model.id,
                model,
            })))
            .then((options) => {
                // Behold the mother of all hacks
                if (this.omgLikeJustStop) return options

                // Behold the very special hack for renaming the very special 'default' cat combo to 'None'
                const renamedOpts = options.map(option => Object.assign(
                    option,
                    option.model &&
                    option.model.modelDefinition &&
                    option.model.modelDefinition.name === 'categoryCombo' &&
                    option.text === 'default'
                        ? { 
                            text: d2i.i18n.getTranslation('none'),
                            meta: {
                                original: { ...option },
                            },
                        }
                        : {},
                ));


                this.setState(
                    { options: renamedOpts },
                    // Behold the hack to select the default option for categoryCombo
                    () => {
                        if (
                            this.props.referenceType === 'categoryCombo'
                            && this.props.defaultToDefaultValue
                            && !this.props.value
                        ) {
                            let defaultOption;

                            for (let i = 0, len = renamedOpts.length; i < len; ++i) {
                                if (renamedOpts[i].meta && renamedOpts[i].meta.original.text === 'default') {
                                    defaultOption = renamedOpts[i]
                                    break;
                                }
                            }

                            if (defaultOption) {
                                this.props.onChange({ target: { value: defaultOption.model } })
                            }
                        }
                    },
                );

                return renamedOpts;
            }).then(opts => {
                this.props.onOptionsLoaded && this.props.onOptionsLoaded(this.props.referenceType, opts)
                return opts;
            });
    }

    render() {
        const {
            errorStyle,
            errorText,
            modelDefinition,
            models,
            referenceType,
            referenceProperty,
            isInteger,
            multiLine,
            fullWidth,
            translateOptions,
            options,
            model,
            queryParamFilter,
            quickAddLink,
            preventAutoDefault,
            style,
            orFilter,
            onOptionsLoaded,
            ...other
        } = this.props;

        /* Because of bad alignment of material ui textfield and selectfield, the compoents becomes skewed when
            using the hide method EditModelForm.component (setting the display to none/block). The component 
            must instead chose to either use display:none from style or its defined display:flex. 
        */
        if (style && style.display && style.display === 'none') {
            return null;
        }
        return (
            <div style={wrapStyles}>
                {this.state.isRefreshing && <RefreshMask horizontal />}
                <DropDown
                    {...other}
                    errorText={this.props.errorText}
                    top={this.props.top}
                    options={this.state.options}
                    value={this.props.value ? this.props.value.id : this.props.value}
                    onChange={this.onChange}
                    fullWidth={fullWidth}
                />
                {quickAddLink &&
                <QuickAddLink
                    referenceType={this.props.referenceType}
                    onRefreshClick={this.onRefreshClick}
                />}
            </div>
        );
    }
}

DropDownAsync.propTypes = {
    value: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    referenceType: PropTypes.string.isRequired,
    queryParamFilter: PropTypes.array,
    orFilter: PropTypes.bool,
    errorText: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    translateOptions: PropTypes.bool,
    preventAutoDefault: PropTypes.bool,
    isInteger: PropTypes.bool,
    quickAddLink: PropTypes.bool,
    multiLine: PropTypes.bool,
    fullWidth: PropTypes.bool,
    defaultToDefaultValue: PropTypes.bool,
    style: PropTypes.object,
    errorStyle: PropTypes.object,
    referenceProperty: PropTypes.string,
    modelDefinition: PropTypes.object,
    models: PropTypes.object,
    model: PropTypes.object,
    options: PropTypes.array,
    onOptionsLoaded: PropTypes.func,
};

DropDownAsync.defaultProps = {
    queryParamFilter: undefined,
    orFilter: true,
    value: undefined,
    translateOptions: false,
    fullWidth: true,
    multiLine: false,
    isInteger: false,
    quickAddLink: true,
    preventAutoDefault: false,
    errorText: '',
    style: {},
    referenceProperty: '',
    errorStyle: {},
    modelDefinition: {},
    models: {},
    model: {},
    options: [],
};

export default DropDownAsync;

