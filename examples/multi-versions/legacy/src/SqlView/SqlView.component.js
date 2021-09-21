import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import FormHeading from '../EditModel/FormHeading';
import { goToRoute } from '../router-utils';
import LoadingMask from '../loading-mask/LoadingMask.component';
import snackActions from '../Snackbar/snack.actions';

const backToList = () => {
    goToRoute('list/otherSection/sqlView');
};

const styles = {
    menuItem: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
    }
}

class SqlView extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            listGrid: null,
            downloadMenuOpen: false,
            downloadMenuAnchor: null,
        };
    }

    componentDidMount() {
        this.getSqlView();
    }

    async getSqlView() {
        const { d2 } = this.context;
        const { params: { modelId } } = this.props;
        const url = `sqlViews/${modelId}/data`;
        const queryParams = { paging: false };

        try {
            const { listGrid } = await d2.Api.getApi().get(url, queryParams);
            this.setState({ listGrid });
        } catch (error) {
            console.error(error)
            backToList();
            snackActions.show({ message: d2.i18n.getTranslation('sql_query_error'), action: 'ok' });
        }
    }

    openFileLink(file) {
        const { params: { modelId } } = this.props;
        this.closeDownloadMenu();
        window.open(`../api/sqlViews/${modelId}/${file}`, '_blank');
    }

    openDownloadMenu = (event) => {
        this.setState({
            downloadMenuOpen: true,
            downloadMenuAnchor: event.currentTarget,
        });
    }

    closeDownloadMenu = () => {
        this.setState({
            downloadMenuOpen: false,
        });
    }

    renderHeader() {
        const { title } = this.state.listGrid;
        const { d2 } = this.context;
        const headerText = `${d2.i18n.getTranslation('view_data_for')} "${title}"`;
        return (
            <div className="sql-view__header">
                <FormHeading
                    level={1}
                    groupName="otherSection"
                    schema="sqlView"
                    skipTranslation
                >
                    {headerText}
                </FormHeading>
                {this.renderDropDownButton()}
            </div>
        );
    }

    renderDropDownButton() {
        const { d2 } = this.context;
        return (
            <div className="sql-view__dropdown-button">
                <RaisedButton
                    onClick={this.openDownloadMenu}
                    className="sql-view__download-btn"
                    labelPosition="before"
                    primary
                    icon={<HardwareKeyboardArrowDown />}
                    label={d2.i18n.getTranslation('download_as')}
                />
                <Popover
                    open={this.state.downloadMenuOpen}
                    anchorEl={this.state.downloadMenuAnchor}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                    onRequestClose={this.closeDownloadMenu}
                >
                    <Menu>
                        { this.renderDropDownMenuItems() }
                    </Menu>
                </Popover>
            </div>
        );
    }

    renderDropDownMenuItems() {
        const { d2 } = this.context;
        return [
            { label: 'excel', file: 'data.xls' },
            { label: 'csv', file: 'data.csv' },
            { label: 'pdf', file: 'data.pdf' },
            { label: 'html', file: 'data.html+css' },
            { label: 'xml', file: 'data.xml' },
            { label: 'json', file: 'data.json' },
        ].map(({ label, file }) => (
            <MenuItem
                key={label}
                style={styles.menuItem}
                primaryText={d2.i18n.getTranslation(label)}
                onClick={() => this.openFileLink(file)} // eslint-disable-line react/jsx-no-bind
            />
        ));
    }

    /* eslint-disable react/no-array-index-key */
    renderCell = (cell, index) => {
        const isObject = typeof cell === 'object' && cell != null;
        const formattedValue = isObject ? JSON.stringify(cell, null, 2) : cell;

        return <td key={`cell${index}`}>{formattedValue}</td>;
    };

    renderRow = (row, index) => (
        <tr key={`row${index}`}>{row.map(this.renderCell)}</tr>
    );
    /* eslint-enable react/no-array-index-key */

    renderTable() {
        const { listGrid: { headers, rows } } = this.state;
        return (
            <table className="sql-view__table">
                <thead>
                    <tr>
                        {headers.map(({ name }) => <th key={name}>{name}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(this.renderRow)}
                </tbody>
            </table>
        );
    }

    render() {
        if (!this.state.listGrid) {
            return <LoadingMask />;
        }

        return (
            <div>
                {this.renderHeader()}
                <Paper className="sql-view__content">
                    {this.renderTable()}
                </Paper>
            </div>
        );
    }
}
SqlView.propTypes = {
    params: PropTypes.shape({
        modelId: PropTypes.string,
    }).isRequired,
};

SqlView.contextTypes = {
    d2: PropTypes.object,
};

export default SqlView;
