# Static Files

The DHIS2 Application Platform supports

## Javascript File Imports (.png, .jpg, .jpeg, .bmp, .gif, .svg , etc.)

Importing a non-javascript and non-css file from within your javascript source will cause that file to either be embedded in the javascript bundle (if it is small enough) or saved as an external file and referenced by URL. The platform will do the right thing automatically here.

```js
import myImage from './myimage.png'

function MyImage() {
    return <img src={myImage} />
}
```

## Custom static files

!> **WARNING** Only use if you know what you're doing, in most cases it is preferable to `include` static assets from your javascript source

> **NOTE** When referencing these files, make sure you prefix any paths with the `PUBLIC_URL` [environment variable](../config/environment) (`process.env.PUBLIC_URL`) to ensure that the file is always referenced relative to your application's root, rather than the domain root!

Any files located in the `./public` directory (relative to the app's `package.json` file) will be served as a static file by the compiled app. For instance, if you do the following:

```sh
> echo "THIS IS A TEST" > ./public/test.txt
> yarn start
```

Then a text file with the content `THIS IS A TEST` will be available at `http://localhost:3000/test.txt`
