import React from 'react';
import Loadable from 'react-loadable';
import LoadingMask from '../loading-mask/LoadingMask.component';

const LoadableComponent = opts =>
    Loadable({
        loading: LoadingMask,
        ...opts,
    });

export default LoadableComponent;

export const LoadableMap = opts =>
    Loadable.Map({
        loading: LoadingMask,
        ...opts,
    });

/**
 * HOC that wraps LoadableComponent with
 * additional loaders (any promise), that should
 * always be resolved before the component is loaded.
 * This is useful to load data before the component is rendered.
 * Note that the loaders are also reloaded by default when the modelType or
 * pathName changes.
 *
 * @param {object} loadableOpts Loadable options
 * @param {Promise[]|Promise} loaders Promises that should be resolved.
 * @param {object} loaderOpts Loaders options.
 * @param {function} loaderOpts.shouldRunLoaders - A predicate that is called when
 * the component is updated, and decided if the loaders should run.
 * The predicate is called with (props, nextProps).
 *
 * All the loaders will be called with the props of the component.
 */
export const LoadableWithLoaders = (loadableOpts, loaders, loaderOpts = {}) => {
    const LoadedComponent = LoadableComponent(loadableOpts);
    const Loader = loadableOpts.loading || LoadingMask;

    const defaultShouldRunLoaders = (props, nextProps) =>
        nextProps.params.modelType !== props.params.modelType ||
        nextProps.location.pathname !== props.location.pathname;

    const shouldRunLoaders =
        loaderOpts.shouldRunLoaders &&
        loaderOpts.shouldRunLoaders === 'function'
            ? loaderOpts.shouldRunLoaders
            : defaultShouldRunLoaders;
    return class WithLoaders extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: true,
                error: false,
            };
        }

        componentWillMount() {
            // Start loading the component instead of waiting for loaders to resolve
            LoadedComponent.preload();
            if (typeof loaders === 'function') {
                // eslint-disable-next-line no-param-reassign
                loaders = [loaders];
            }
        }

        componentDidMount() {
            this.runLoaders();
        }
        componentWillReceiveProps(nextProps) {
            // reload when switching sections
            if (shouldRunLoaders(this.props, nextProps)) {
                this.runLoaders(nextProps);
            }
        }

        runLoaders = (propsToUse = this.props) => {
            Promise.all(loaders.map(loader => loader(propsToUse)))
                .then(() => this.setState({ loading: false }))
                .catch(error => {
                    console.error(error);
                    this.setState({ error });
                });
        };

        render() {
            if (!this.state.loading && !this.state.error) {
                return <LoadedComponent {...this.props} />;
            }
            return <Loader error={this.state.error} />;
        }
    };
};
