import React from 'react';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';
import noop from 'd2-utilizr/lib/noop';

function MaintenanceSideBar(props) {
    const sideBarWrapperStyle = {};

    return (
        <div style={sideBarWrapperStyle}>
            <Sidebar
                sections={props.sections}
                onChangeSection={noop}
                onSectionClick={props.onChangeSection || noop}
                currentSection={props.currentSection}
                styles={Object.assign({ leftBar: { overflowY: 'initial' } }, props.style)}
            />
            {props.children}
        </div>
    );
}

MaintenanceSideBar.propTypes = {
    style: React.PropTypes.object,
    sections: React.PropTypes.arrayOf(React.PropTypes.object),
    onChangeSection: React.PropTypes.func,
    currentSection: React.PropTypes.string,
    children: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.array,
    ]),
};
MaintenanceSideBar.defaultProps = {
    style: {},
    sections: [],
};

export default MaintenanceSideBar;
