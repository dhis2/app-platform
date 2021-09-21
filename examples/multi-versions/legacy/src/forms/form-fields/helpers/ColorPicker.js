import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'd2-ui/lib/button/Button';
import LoadableComponent from '../../../utils/LoadableComponent';

const LoadableSwatchesPicker = LoadableComponent({
    loader: () => import('react-color/lib/components/swatches/Swatches'),
});

const LoadableChromePicker = LoadableComponent({
    loader: () => import('react-color/lib/components/chrome/Chrome'),
});

const colors = [
    ['#ffcdd2', '#e57373', '#d32f2f', '#f06292', '#c2185b', '#880e4f', '#f50057'],
    ['#e1bee7', '#ba68c8', '#8e24aa', '#aa00ff', '#7e57c2', '#4527a0', '#7c4dff', '#6200ea'],
    ['#c5cae9', '#7986cb', '#3949ab', '#304ffe'],
    ['#e3f2fd', '#64b5f6', '#1976d2', '#0288d1'],
    ['#40c4ff', '#00b0ff', '#80deea'],
    ['#00acc1', '#00838f', '#006064'],
    ['#e0f2f1', '#80cbc4', '#00695c', '#64ffda'],
    ['#c8e6c9', '#66bb6a', '#2e7d32', '#1b5e20'],
    ['#00e676', '#aed581', '#689f38', '#33691e'],
    ['#76ff03', '#64dd17', '#cddc39', '#9e9d24', '#827717'],
    ['#fff9c4', '#fbc02d', '#f57f17', '#ffff00', '#ffcc80', '#ffccbc', '#ffab91'],
    ['#bcaaa4', '#8d6e63', '#4e342e'],
    ['#fafafa', '#bdbdbd', '#757575', '#424242'],
    ['#cfd8dc', '#b0bec5', '#607d8b', '#37474f'],
];

const styles = {
    wrapper: {
        position: 'relative',
        overflow: 'visible',
    },
    cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    picker: {
        position: 'absolute',
        zIndex: '100',
    },
    buttonColor: {
        backgroundColor: '#fffff',
        color: '#000',
        textAlign: 'center',
        position: 'relative',
        minWidth: 129,
        height: 36,
        lineHeight: 2.5,
        marginTop: 10,
        boxShadow: '0 1px 6px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.12)',
        cursor: 'pointer',
    },
    unsetButton: {
        backgroundColor: '#ccc',
        color: 'black',
        marginLeft: 20,
    }
};

/**
 * Computes the "darkness" of a color.
 * So that we can change the text-color to white or black
 * according to the selected color;
 * @returns True if the color is "dark", or False
 * if color is falsy or "light"
 */
function isColorDark(color) {
    if (!color) return false;
    const hex = color.substring(1);
    const bigint = parseInt(hex, 16);
    /* eslint-disable no-bitwise */
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    /* eslint-enable no-bitwise */

    const avg = (r + g + b) / 3;
    return avg < 140;
}

export default class ColorPicker extends Component {
    state = {
        open: false,
    }

    getColorPickerProps = () => {
        const color = this.props.color || '#ff9800'
        const isDark = isColorDark(color);
        const canChooseAnyColor = this.props.modelName === 'option';
        const LoadablePicker = canChooseAnyColor ? LoadableChromePicker : LoadableSwatchesPicker;
        const mergedStyles = {
            ...styles,
            buttonColor: {
                ...styles.buttonColor,
                backgroundColor: color,
                color: isDark ? '#fff' : '#000',
            },
        };
        const pickerProps = {
            color,
            onChangeComplete: this.handleColorChange,
        };

        if (!canChooseAnyColor) {
            pickerProps.colors = colors;
        }

        return { mergedStyles, LoadablePicker, pickerProps };
    };

    handleOpenColor = () => {
        this.setState({ open: !this.state.open });
    };

    handleCloseColor = () => {
        this.setState({ open: false });
    };

    handleColorChange = (val) => {
        this.setState({ open: false });
        this.props.updateStyleState({ color: val.hex });
    };

    handleUnsetColor = () => {
        this.props.updateStyleState({ color: '' })
    }

    render() {
        const { mergedStyles, LoadablePicker, pickerProps } = this.getColorPickerProps();

        return (
            <div style={mergedStyles.wrapper}>
                <Button
                    style={mergedStyles.buttonColor}
                    onClick={this.handleOpenColor}
                >
                    {this.props.color ||
                        this.context.d2.i18n.getTranslation('select_color')}
                </Button>

                {this.props.color &&
                    <Button
                        style={{
                            ...styles.buttonColor,
                            ...styles.unsetButton,
                        }}
                        onClick={this.handleUnsetColor}
                    >
                        {this.context.d2.i18n.getTranslation('deselect_color')}
                    </Button>
                }
                {this.state.open && (
                    <div>
                        {/* eslint-disable jsx-a11y/no-static-element-interactions */}
                        <div
                            style={styles.cover}
                            onClick={this.handleCloseColor}
                        />
                        {/* eslint-enable jsx-a11y/no-static-element-interactions */}
                        <div style={mergedStyles.picker}>
                            <LoadablePicker {...pickerProps} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    updateStyleState: PropTypes.func.isRequired,
    modelName: PropTypes.string.isRequired,
};

ColorPicker.contextTypes = {
    d2: PropTypes.object,
};
