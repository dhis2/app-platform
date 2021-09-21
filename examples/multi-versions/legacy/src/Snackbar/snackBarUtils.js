import React from 'react';
import { branch, lifecycle } from 'recompose';
import snackActions from './snack.actions';

export const emptyComponent = () => null;

export const RenderSnackbarError = lifecycle({
    componentDidMount() {
        snackActions.show(this.props.snackAction);
    },
})(emptyComponent);

/**
 * Return a component that renders nothing, but fires
 * the snackbar-action
 * @param test - test to pass to recompose branch
 * @param snackAction - snackBarAction to fire if test passes
 * @returns {*} A component that renders nothing if test passes
 */
export const branchWithMessage = (test, snackAction) =>
    branch(test, _ => _ =>
        <RenderSnackbarError snackAction={snackAction} />,
    );
