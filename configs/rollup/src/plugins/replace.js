import replace from '@rollup/plugin-replace'
export default ({ name, mode }) =>
    replace({
        preventAssignment: true,
        values: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env.REACT_APP_DHIS2_BASE_URL': 'undefined',
            'process.env.REACT_APP_DHIS2_APP_NAME': JSON.stringify(name),
            'process.env': '{}',
        },
    })
