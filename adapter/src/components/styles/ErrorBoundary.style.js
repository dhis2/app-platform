import css from 'styled-jsx/css'

const bgColor = '#F4F6F8',
    iconColor = '#B0BEC5',
    primaryTextColor = '#000000',
    secondaryTextColor = '#494949',
    errorColor = '#D32F2F',
    grey050 = '#FBFCFD',
    grey100 = '#F8F9FA',
    grey600 = '#6C7787'

export default css`
    .mask {
        min-height: 480px;
        height: 100%;
        width: 100%;

        overflow: auto;
        overflow-y: auto;

        color: ${primaryTextColor};
        background-color: ${bgColor};

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .fullscreen {
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }

    .container {
        text-align: center;
        color: black;
    }

    .icon {
        width: 96px;
        height: 96px;
        color: ${iconColor};
        margin-bottom: 24px;
    }

    .message {
        font-size: 24px;
        font-weight: normal;
        margin-top: 0;
        margin-bottom: 24px;
    }

    .retry {
        margin-bottom: 24px;
    }

    .drawerToggle {
        font-size: 12px;
        color: ${secondaryTextColor};
        text-decoration: underline;
        cursor: pointer;
        margin-bottom: 12px;
        background: none;
        border: none;
    }

    .drawer {
        margin: auto;
        padding: 8px;
        display: block;
        height: 250px;
        width: min(500px, 100%);
        overflow: auto;
        overflow-y: auto;
        background: ${grey050};
        border: 1px solid ${secondaryTextColor};
        text-align: left;
    }

    .hidden {
        display: none;
    }

    .errorIntro {
        margin-bottom: 16px;
    }

    .errorIntro p {
        margin-top: 0;
        margin-bottom: 4px;
        font-size: 14px;
        color: ${secondaryTextColor};
    }

    .errorDetails {
        white-space: pre-wrap;
        font-size: 12px;
        line-height: 1.2;
        color: ${errorColor};
        font-family: Menlo, Courier, monospace !important;
    }

    .pluginBoundary {
        background-color: ${grey100};
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-block-start: 16px;
    }

    .pluginErrorMessage {
        margin-block-start: 8px;
        color: ${grey600};
    }

    .pluginErrorCopy {
        margin-block-start: 8px;
        color: ${grey600};
        text-decoration: underline;
        font-size: 14px;
    }

    .pluginRetry {
        margin-block-start: 16px;
    }
`
