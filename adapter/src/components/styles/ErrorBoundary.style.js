import css from 'styled-jsx/css'

const bgColor = '#F4F6F8',
    iconColor = '#B0BEC5',
    primaryTextColor = '#000000',
    secondaryTextColor = '#494949',
    errorColor = 'red'

export default css`
    .mask {
        height: 100%;
        width: 100%;

        overflow: auto;
        overflow-y: auto;

        color: ${primaryTextColor};
        background-color: ${bgColor};

        display: flex;

        min-width: 640px;
        min-height: 480px;

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
        margin-bottom: 24px;
    }

    .link {
        font-size: 18px;
        text-decoration: underline;
        cursor: pointer;
        margin-bottom: 24px;
    }

    .drawerToggle {
        font-size: 12px;
        color: ${secondaryTextColor};
        text-decoration: underline;
        cursor: pointer;
        margin-bottom: 12px;
    }

    .drawerVisible {
        padding: 8px;
        display: block;
        height: 150px;
        width: 500px;
        overflow: auto;
        overflow-y: auto;
        border: 1px solid ${secondaryTextColor};
        text-align: left;
    }

    .drawerHidden {
        display: none;
    }

    .errorIntro {
        font-size: 12px;
        line-height: 1.2;
        color: ${secondaryTextColor};
        margin-bottom: 8px;
        font-family: Menlo, Courier, monospace !important;
    }

    .errorDetails {
        font-size: 12px;
        line-height: 1.2;
        color: ${errorColor};
        font-family: Menlo, Courier, monospace !important;
    }
`
