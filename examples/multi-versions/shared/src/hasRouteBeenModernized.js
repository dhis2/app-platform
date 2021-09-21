import { modernizedRoutes } from './modernizedRoutes.js'

export const hasRouteBeenModernized = route => {
  return !!modernizedRoutes.find(({ regExp }) => regExp.test(route))
}
