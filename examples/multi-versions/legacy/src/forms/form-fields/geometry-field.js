import React from 'react';
import TextField from '../../forms/form-fields/text-field';
import { isNumber } from 'd2-ui/lib/forms/Validators';
import { getOr } from 'lodash/fp';

// Allows parsed numbers
function isNumeric(number) {
    return !isNaN(parseFloat(number));
}

function isPoint(poly) {
    return (
        Array.isArray(poly) &&
        (poly.length === 2 && isNumeric(poly[0]) && isNumeric(poly[1]))
    );
}

// These actually return true on empty string and undefined, so no error is shown with empty field
function isValidLatitude(value) {
    return isNumber(value) && value <= 90 && value >= -90;
}
isValidLatitude.message = 'a_latitude_should_be_a_number_between_-90_and_90';

function isValidLongitude(value) {
    return isNumber(value) && value <= 180 && value >= -180;
}
isValidLongitude.message =
    'a_longitude_should_be_a_number_between_-180_and_180';

function isValidCoordinate(coord) {
    return isPoint(coord) && isValidLongitude(coord[0]) && isValidLatitude(coord[1])
}
const featureTypes = {
    POINT: 'Point',
    POLYGON: 'Polygon',
};

class GeometryField extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            longErr: undefined,
            latErr: undefined,
        };

        this.getTranslation = context.d2.i18n.getTranslation.bind(
            context.d2.i18n
        );
    }

    getLongitude = () => getOr('', 'value.coordinates[0]', this.props);

    getLatitude = () => getOr('', 'value.coordinates[1]', this.props);

    getLongLat = () => [this.getLongitude(), this.getLatitude()];

    updateGeometryPoint(long, lat) {
        const coordinates = [long, lat];
        const geometry = {
            type: featureTypes.POINT,
            coordinates,
        };
        if (!long && !lat) {
            this.props.onChange({ target: { value: null } });
        } else {
            this.props.onChange({
                target: {
                    value: geometry,
                },
            });
        }
    }

    handleLatitude = event => {
        let lat = event.target.value;
        const long = this.getLongitude();
        
        if (!isValidLatitude(lat)) {
            this.setState({
                latError: this.getTranslation(isValidLatitude.message),
            });
        } else {
            this.setState({ latError: undefined });
        }
        this.updateGeometryPoint(long, lat);
    };

    handleLongitude = event => {
        let long = event.target.value;
        const lat = this.getLatitude();

        if (!isValidLongitude(long)) {
            this.setState({
                longError: this.getTranslation(isValidLongitude.message),
            });
        } else {
            this.setState({ longError: undefined });
        }
        this.updateGeometryPoint(long, lat);
    };

    renderLatLongFields() {
        return (
            <div>
                <TextField
                    {...this.props}
                    labelText={this.getTranslation('latitude')}
                    value={this.getLatitude()}
                    onChange={this.handleLatitude}
                    errorText={this.state.latError}
                />
                <TextField
                    {...this.props}
                    labelText={this.getTranslation('longitude')}
                    value={this.getLongitude()}
                    onChange={this.handleLongitude}
                    errorText={this.state.longError}
                />
            </div>
        );
    }

    renderPolygonField() {
        return (
            <TextField
                {...this.props}
                labelText={this.getTranslation('coordinates')}
                value={this.getTranslation(
                    'polygon_coordinates_are_not_editable'
                )}
                disabled
            />
        );
    }

    render() {
        const type = (this.props.value && this.props.value.type) || undefined;
        return (
            <div>
                {(type === featureTypes.POINT || type === undefined) ?
                    this.renderLatLongFields() : this.renderPolygonField()}
            </div>
        );
    }
}
GeometryField.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
};
GeometryField.contextTypes = { d2: React.PropTypes.object.isRequired };

// Used to actually prevent saving
export const validators = [
    {
        validator(value) {
            if (
                value == null ||
                (value && value.type !== featureTypes.POINT)
            ) {
                return true;
            }
            return (
                value &&
                value.type === featureTypes.POINT &&
                value.coordinates &&
                isValidCoordinate(value.coordinates)
            );
        },
        message: 'invalid_coordinate',
    },
];

export default GeometryField;
