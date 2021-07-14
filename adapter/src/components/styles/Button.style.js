// These styles are copied from @dhis2/ui, so the fatal error boundary doesn't
// need to depend on it

import css from 'styled-jsx/css'

// From UI colors and theme:
const grey900 = '#21934',
    grey500 = '#a0adba',
    grey200 = '#f3f5f7',
    primary600 = '#147cd7'

export default css`
    button {
        display: inline-flex;
        position: relative;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: 400;
        letter-spacing: 0.5px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.6, 1);
        user-select: none;
        color: ${grey900};

        /*medium*/
        height: 36px;
        padding: 0 12px;
        font-size: 14px;
        line-height: 16px;

        /*basic*/
        border: 1px solid ${grey500};
        background-color: #f9fafb;
    }

    button:disabled {
        cursor: not-allowed;
    }

    button:focus {
        /* Prevent default browser behavior which adds an outline */
        outline: none;
    }

    /* Use the ::after pseudo-element for focus styles */
    button::after {
        content: ' ';
        pointer-events: none;

        position: absolute;
        top: -2px;
        right: -2px;
        bottom: -2px;
        left: -2px;
        z-index: 1;

        border: 2px solid transparent;
        border-radius: inherit;

        transition: border-color 0.15s cubic-bezier(0.4, 0, 0.6, 1);
    }

    /* Prevent focus styles on active and disabled buttons */
    button:active:focus::after,
    button:disabled:focus::after {
        border-color: transparent;
    }

    button:hover {
        border-color: ${grey500};
        background-color: ${grey200};
    }

    button:active,
    button:active:focus {
        border-color: ${grey500};
        background-color: ${grey200};
        box-shadow: 0 0 0 1px rgb(0, 0, 0, 0.1) inset;
    }

    button:focus {
        background-color: #f9fafb;
    }

    button:focus::after {
        border-color: ${primary600};
    }
`
