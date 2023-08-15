import css from 'styled-jsx/css'

export const styles = css`
    div.app-shell-adapter {
        width: 100vw;
        height: 100vh;

        display: flex;
        flex-direction: column;
    }
    div.app-shell-app {
        flex: 1 1 auto;
        overflow: auto;
        height: 100%;
    }
    div.app-shell-plugin {
        flex: 1 1 auto;
        overflow: hidden;
        height: 100%;
    }
`
