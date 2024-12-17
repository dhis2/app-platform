import React from 'react'

const Plugin = () => {
    const [width, setWidth] = React.useState()
    const [height, setHeight] = React.useState(122)
    const [toThrow, setToThrow] = React.useState(false)

    if (toThrow) {
        throw new Error('died')
    }

    return (
        <section style={{ width, height, background: 'pink' }}>
            <button
                onClick={() =>
                    setWidth((current) => (current === 888 ? 111 : 888))
                }
            >
                Change width ({width})
            </button>
            <button
                onClick={() =>
                    setHeight((current) => (current === 244 ? 122 : 244))
                }
            >
                Change height ({height})
            </button>
            <button onClick={() => setToThrow(true)}>Throw</button>
            {"Hello I'm a Plugin"}
        </section>
    )
}

export default Plugin
