import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

const useLazyParcel = lazyModuleFetcher => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(undefined)
    const [parcel, setParcel] = useState(undefined)
    useLayoutEffect(() => {
        setLoading(true)
        lazyModuleFetcher()
            .then(parcel => {
                console.log(parcel)
                setLoading(false)
                setParcel(parcel.default())
            })
            .catch(err => {
                console.log('err', err)
                setLoading(false)
                setError(err)
            })
    }, [lazyModuleFetcher])

    return { loading, error, parcel }
}

export const LegacyAppContainer = ({ lazyModuleFetcher, ...props }) => {
    const mountPointRef = useRef()
    const { loading, error, parcel } = useLazyParcel(lazyModuleFetcher)

    useEffect(() => {
        if (!parcel) {
            return
        }
        parcel.mount(mountPointRef.current, props)
        return () => {
            parcel.unmount()
        }
    }, [parcel /*, props */])

    useEffect(() => {
        parcel?.update(props)
    }, [props])

    return (
        <>
            {loading && 'Loading legacy app...'}
            {error && 'Failed to load legacy app!'}
            <div ref={mountPointRef} />
        </>
    )
}
