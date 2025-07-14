import { defineConfig } from 'vite'

// https://vite.dev/config/
const config = defineConfig(async (configEnv) => {
    const { mode } = configEnv
    return {
        // In dev mode, doesn't clear the terminal when a file is updated
        clearScreen: mode !== 'development',
    }
})

export default config
