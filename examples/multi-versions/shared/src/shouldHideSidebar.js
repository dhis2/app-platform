const routesWithoutSidebar = [
  new RegExp(/^[/]edit[/].+/),
  new RegExp(/^[/]clone[/]/),
  new RegExp(/^[/]sqlViews[/]/),
]

export const shouldHideSidebar = route => {
  return !!routesWithoutSidebar.find(regExp => regExp.test(route))
}
