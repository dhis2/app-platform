import { modernizedRoutes } from 'shared'
import { ListForModelType } from './router/ListForModelType.component'

const legacyRoutes = {
  '/list/dataElementSection/dataElement': {
    path: '/legacy/list/dataElementSection/dataElement',
    component: ListForModelType,
  },
}

// Make sure that "src/shared/__refactoring/modernizedRoutes.js" is the
// source of truth
modernizedRoutes.forEach(({ path }) => {
  if (!legacyRoutes[path]) {
    throw new Error('You need to implement the legacy route for', path)
  }
})

export { legacyRoutes }
