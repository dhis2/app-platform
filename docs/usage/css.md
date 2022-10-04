---
title: CSS
---

## CSS Files

You can import `.css` files into your application. Prefixes for different browsers will automatically be pre-pended to all CSS rules.

```css
/* App.css */
p {
    color: red;
}
```

```js
/* App.js */
import React from 'react'
import './App.css'

export default () => (
    <div>
        <p>All p tags will be red!</p>
    </div>
)
```

## CSS in JS

The DHIS2 Application Platform has built-in support for [`styled-jsx`](https://github.com/zeit/styled-jsx), which allows applications and libraries to embed CSS rules within their React components. The platform will automatically transpile the code with the `styled-jsx` babel plugin.

```js
import React from 'react'

export default () => (
    <div>
        <p>only this paragraph will get the style :)</p>

        {/* you can include <Component />s here that include
         other <p>s that don't get unexpected styles! */}

        <style jsx>{`
            p {
                color: red;
            }
        `}</style>
    </div>
)
```

You can also declare your CSS styles in a separate file, like so:

```js
/* App.styles.js */
import css from 'styled-jsx/css'

// We target .root here, which allows us to explicitly target only the container div
export default css`
    .root {
        position: absolute;
        top: 48px;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
    }
`
```

```js
/* App.js */
import React from 'react'
import styles from './App.styles'

export default () => (
    <div className="root">
        {/* ONLY this div (with the .root class and <style jsx> child) 
            will be styled by the above CSS rule! */}
        <style jsx>{styles}</style>

        {/* This div does not have the .root class, so it will not be
            styled by the above CSS rule! */}
        <div>UNSTYLED</div>
    </div>
)
```
