declare module '*.module.css' {
  interface Classes {
    [key: string]: string
  }
  const classes: Classes
  export default classes
}
