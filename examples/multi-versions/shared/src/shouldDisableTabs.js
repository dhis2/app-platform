const routesWithDisabledTabs = [
  new RegExp(/^[/]edit[/].+/),
  new RegExp(/^[/]clone[/]/),
  new RegExp(/^[/]sqlViews[/]/),
]

export const shouldDisableTabs = route => {
  return !!routesWithDisabledTabs.find(regExp => regExp.test(route))
}
