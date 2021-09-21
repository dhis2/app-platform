import React from 'react';
import AssignDataElements from '../../assign-data-elements/AssignDataElements';

export default props =>
    props.programStage$ &&
    <AssignDataElements outerDivStyle={{ marginTop: '15px' }} {...props} programStage$={props.programStage$} />;
