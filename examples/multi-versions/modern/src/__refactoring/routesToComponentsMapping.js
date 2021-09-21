import { modernizedRoutes } from 'shared'
import { ViewDataElementList } from '../components'

const routesToComponentsMapping = {
  '/list/dataElementSection/dataElement': ViewDataElementList,
}

// Make sure that "src/shared/__refactoring/modernizedRoutes.js" is the
// source of truth
modernizedRoutes.forEach(({ path }) => {
  if (!routesToComponentsMapping[path]) {
    throw new Error('You need to implement the legacy route for', path)
  }
})

export { routesToComponentsMapping }
