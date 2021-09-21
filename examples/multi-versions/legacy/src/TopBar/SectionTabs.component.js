import React, { PropTypes } from 'react';
import TopBarButtons from '../TopBar/TopBarButtons.component';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';
import noop from 'd2-utilizr/lib/noop';

function SectionTabs(props) {
    const styles = {
        navStyle: {
            display: 'flex',
            flexOrientation: 'row',
            position: 'fixed',
            background: '#E4E4E4',
            width: '100%',
            zIndex: 10,
            top: '48px',
            flex: 1,
        },
        navButtonStyle: {
            display: 'inline-block',
            padding: '1rem',
            width: '100%',
            borderBottom: '2px solid #DDD',
            color: '#AAA',
        },
        navWrapButtonStyle: {
            width: 'auto',
        },
        extraButtons: {
            flex: 0,
            textAlign: 'right',
        },
        tabItemContainerStyle: {
            width: 'auto',
            backgroundColor: 'transparent',
        },
        tabsStyle: {
            // flex: 1,
        },
        tabsWrap: {
            flex: 1,
        },
        tabStyle: {
            color: 'rgba(0,0,0,0.6)',
        },
        disabledTabStyle: {
            color: 'rgba(0,0,0,0.2)',
        },
        inkBarStyle: {},
        disabledInkBarStyle: {
            opacity: 0.4,
        },
    };

    const sections = props.sections
        .map((section, index) => (
            <Tab
                key={index}
                style={props.disabled ? styles.disabledTabStyle : styles.tabStyle}
                disabled={props.disabled}
                label={section.label}
                value={section.key}
            />
        ));

    return (
        <div style={styles.navStyle}>
            <div style={styles.tabsWrap}>
                <Tabs
                    value={props.current}
                    // @TODO(not working): Tabs onChange not called
                    onChange={props.changeSection}
                    style={styles.tabsStyle}
                    tabItemContainerStyle={styles.tabItemContainerStyle}
                    inkBarStyle={props.disabled ? styles.disabledInkBarStyle : styles.inkBarStyle}
                >
                    {sections}
                </Tabs>
            </div>
            <div style={styles.extraButtons}>
                <TopBarButtons disabled={props.disabled} />
            </div>
        </div>
    );
}
SectionTabs.propTypes = {
    sections: PropTypes.array,
    current: PropTypes.string,
    changeSection: PropTypes.func,
};
SectionTabs.defaultProps = {
    sections: [],
    current: 'unknown',
    changeSection: noop,
};

export default SectionTabs;
