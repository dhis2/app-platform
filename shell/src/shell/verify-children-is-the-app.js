import React from 'react'

export default function verifyChildrenIsTheApp(children) {
    const childCount = React.Children.count(children)
    if (childCount !== 1) {
        throw new Error(
            `The app-shell expects exactly 1 child (the app), received ${childCount} children`
        )
    }
}
