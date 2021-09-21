import React from 'react';
import Paper from 'material-ui/Paper/Paper';
import EditModelForm from './EditModelForm.component';
import { goToAndScrollUp } from '../router-utils';

export default function EditModel(props) {
    return (
        <Paper>
            <EditModelForm
                {...props}
                onCancel={() => goToAndScrollUp(`/list/${props.groupName}/${props.modelType}`)}
                onSaveSuccess={() => goToAndScrollUp(`/list/${props.groupName}/${props.modelType}`)}
            />
        </Paper>
    );
}
