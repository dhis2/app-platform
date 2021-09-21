import React from 'react';

import AppTheme from '../App/app.theme';

export default {
    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: AppTheme,
        };
    },
};
