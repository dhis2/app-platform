import Button from 'd2-ui/lib/button/Button';
import PropTypes from 'prop-types';
import React, { Component, createRef } from 'react';

const MAX_POLL_TRIES = 5;

export const ImageValidators = [{
    // validator(value, formState) {},
    validator() {},
    message: 'invalid_image',
}];

const ImageSelectText = ({ children }) => {
    return (
        <p
            className="image-select__text"
            style={{ margin: 0, paddingTop: 4 }}
        >
            {children}
        </p>
    )
}

ImageSelectText.propTypes = {
    children: PropTypes.any.isRequired,
}

const ImageSelectButton = ({ disabled, children, onClick }) => (
    <span
        onClick={(...args) => {
            if (disabled) return
            onClick(...args)
        }}
        style={{
            display: 'inline-block',
            marginRight: 4,
            background: 'rgb(204, 204, 204)',
            color: 'black',
            height: 36,
            lineHeight: '36px',
            textTransform: 'uppercase',
            fontWeight: 500,
            fontSize: '14px',
            letterSpacing: 0,
            cursor: 'pointer',
            padding: '0 16px',
            ...(disabled ? {
                color: 'rgba(0, 0, 0, 0.3)',
                background: 'transparent',
                cursor: 'not-allowed',
            } : {}),
        }}
    >
        {children}
    </span>
)

ImageSelectButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.any,
    disabled: PropTypes.bool,
}

export class ImageSelect extends Component {
    fileInputRef = null

    constructor(props, context) {
        super(props, context);

        this.api = context.d2.Api.getApi();
        this.state = {
            initialValue: props.value,
            initialized: !props.value,
            loading: false,
            error: null,
            pending: false,
            removed: false,
        };

        this.onFileSelect = this.onFileSelect.bind(this)
    }

    componentDidMount() {
        // no image exists on init
        if (this.state.initialized) {
            return;
        }

        const { id } = this.props.value
        this.pollStorageStatusWhilePending(id).finally(
            () => this.setState({ initialized: true })
        );
    }

    storageStatusCheckDelay() {
        return new Promise(resolve => setTimeout(resolve, 1000))
    }

    checkStorageStatus(id) {
        return this.api
            .get(`fileResources/${id}`)
            .then(({ storageStatus }) => {
                if (storageStatus === 'PENDING') {
                    this.setState({ pending: true });
                } else if (storageStatus === 'STORED') {
                    this.setState({ pending: false });
                } else {
                    const errorLabel = this.getTranslation('org_unit_image_storage_status_error');
                    const error = new Error(`${errorLabel} ${storageStatus}`);
                    this.setState({ error });
                }

                return storageStatus;
            })
            .catch(error => this.setState({ error }))
    }

    pollStorageStatusWhilePending(id, pollCount = 0) {
        if (pollCount === MAX_POLL_TRIES) {
            const error = new Error('Timed out polling for image storage status update')
            this.setState({ error })
            return
        }

        return this.checkStorageStatus(id).then(storageStatus => {
            if (storageStatus === 'PENDING') {
                return this.storageStatusCheckDelay().then(() =>
                    this.pollStorageStatusWhilePending(id, pollCount + 1)
                );
            }
        });
    }

    onFileSelect(event) {
        const { onChange } = this.props;
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('domain', this.props.domain);

        // Send image to server and save image id as avatar
        this.setState({
            loading: true,
            error: null,
            pending: false,
            removed: false,
        });
        this.api
            .post('fileResources', formData)
            .then(postResponse => {
                const { id: imageId, storageStatus } = postResponse.response.fileResource;

                if (!['PENDING', 'STORED'].includes(storageStatus)) {
                    throw new Error(
                        `Org unit image could not be stored, storageStatus is: ${storageStatus}`
                    );
                }

                const pending = storageStatus === 'PENDING'
                this.setState({ pending, loading: false });

                const imageReference = { id: imageId }
                const target = { value: imageReference };
                onChange({ target });

                if (pending) {
                    this.pollStorageStatusWhilePending(imageId)
                }
            })
            .catch(error => {
                this.setState({ loading: false, error })
                onChange({ target: { value: null } })
            });
    }

    getTranslation(key) {
        return this.context.d2.i18n.getTranslation(key);
    }

    render() {
        const { value: fileReference } = this.props;
        const { id: fileResourceId } = fileReference || {}
        const { removed, initialized, initialValue, loading, error, pending } = this.state;

        const fileResourceReady = initialized && !loading && !error && fileResourceId;
        const isPending = fileResourceReady && pending;
        const displayImage = fileResourceReady && !isPending;
        const wasRemoved = !fileResourceId && removed
        const hasNoImage = !fileResourceId && !loading
        const hasInitialValue = initialValue && initialValue.id
        const dirty = (
            (fileResourceId && !hasInitialValue) ||
            (!fileResourceId && hasInitialValue) ||
            (hasInitialValue && initialValue.id !== fileResourceId)
        )

        return (
            <div
                className="image-select"
                style={{ marginTop: 14 }}
            >
                <label
                    htmlFor="image-select-input"
                    style={{
                        display: 'block',
                        marginBottom: 6,
                        fontSize: 12,
                        lineHeight: '22px',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        color: 'rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {this.getTranslation('label_organisation_unit_image')}
                </label>

                <div style={{ display: 'flex' }}>
                    <label style={{
                        display: 'flex',
                        marginBottom: 4,
                        marginRight: 4,
                        cursor: 'pointer',
                    }}>
                        {!hasNoImage && !error && (
                            <div style={{
                                height: 36,
                                width: 36,
                                borderRight: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {!displayImage && (isPending || loading) && (
                                    <span>...</span>
                                )}

                                {!loading && displayImage && (
                                    <img
                                        alt={this.getTranslation('org_unit_image_alt_text')}
                                        src={`${this.api.baseUrl}/fileResources/${fileResourceId}/data`}
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            height: 'auto',
                                            width: 'auto',
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <Button
                            onClick={() => this.fileInputRef.click()}
                            style={{
                                backgroundColor: '#ff9800',
                                color: 'white',
                            }}
                        >
                            {this.getTranslation('org_unit_image_select_file')}
                        </Button>

                        <input
                            name="image-select-input"
                            onChange={this.onFileSelect}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={r => (this.fileInputRef = r)}
                        />
                    </label>

                    <ImageSelectButton
                        disabled={!this.props.value}
                        onClick={() => {
                            if (initialValue) {
                                this.setState({ removed: true })
                            }

                            this.props.onChange({ target: { value: null } })
                        }}
                    >
                        {this.getTranslation('org_unit_image_remove_image')}
                    </ImageSelectButton>

                    {initialValue && dirty && <ImageSelectButton
                        onClick={
                            () => this.props.onChange({
                                target: {
                                    value: initialValue,
                                },
                            })
                        }
                    >
                        {this.getTranslation('org_unit_image_reset')}
                    </ImageSelectButton>}
                </div>

                {hasNoImage && !removed && !error && !isPending && (
                    <ImageSelectText>
                        {this.getTranslation('org_unit_image_no_image_text')}
                    </ImageSelectText>
                )}

                {!initialized && (
                    <ImageSelectText>
                        {this.getTranslation('org_unit_image_loading_image_data_text')}
                    </ImageSelectText>
                )}

                {loading && (
                    <ImageSelectText>
                        {this.getTranslation('org_unit_image_uploading_image_text')}
                    </ImageSelectText>
                )}

                {error && (
                    <ImageSelectText>
                        <b>
                            {this.getTranslation('org_unit_image_image_upload_error_text')}
                            {' '}
                        </b>

                        {error instanceof Error ? error.message : error.toString()}
                    </ImageSelectText>
                )}

                {isPending && (
                    <ImageSelectText>
                        {this.getTranslation('org_unit_image_image_pending_text')}
                    </ImageSelectText>
                )}

                {(dirty || isPending || wasRemoved) && (
                    <ImageSelectText>
                        <b>{this.getTranslation('org_unit_image_save_reminder')}</b>
                    </ImageSelectText>
                )}
            </div>
        )
    }
}

ImageSelect.contextTypes = {
    d2: PropTypes.object.isRequired,
};

ImageSelect.propTypes = {
    domain: PropTypes.string,
    value: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

ImageSelect.defaultProps = {
    domain: 'ORG_UNIT',
}
