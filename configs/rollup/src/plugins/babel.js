import { babel } from "@rollup/plugin-babel";
import babelConfigFactory from '@dhis2/config-babel/configFactory'

export default ({ mode }) => {
  babel({
    ...babelConfigFactory({ mode, moduleType: 'es' }),
    babelHelpers: "bundled", // TODO: Shared babel helpers
    exclude: "node_modules/**",
  })
}