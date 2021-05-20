import React, { useState, useEffect } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

const query = {
    visualizations: {
        resource: 'visualizations',
        params: ({ page }) => ({
            pageSize: 3,
            page,
            fields: ['id', 'name'],
        }),
    },
}

// Usage: 'await wait(500)'
const wait = ms =>
    new Promise(resolve => {
        setTimeout(resolve, ms)
    })

export default function CacheableComponent() {
    const [vizList, setVizList] = useState([])
    const engine = useDataEngine()

    useEffect(() => {
        const cascadingFetch = async () => {
            const res1 = await engine.query(query, { variables: { page: 1 } })
            console.log('[cascadingFetch] received first res; waiting 250 ms')
            await wait(250)
            const res2 = await engine.query(query, { variables: { page: 2 } })
            console.log('[cascadingFetch] received res 2; waiting 500 ms')
           
            // Intermediate test:
            setVizList([
                ...res1.visualizations.visualizations,
                ...res2.visualizations.visualizations,
            ])

            await wait(500)
            const res3 = await engine.query(query, { variables: { page: 3 } })
            console.log('[cascadingFetch] received res 3; waiting 750 ms')
            await wait(750)
            const res4 = await engine.query(query, { variables: { page: 4 } })
            console.log('[cascadingFetch] received res 4')

            setVizList([
                ...res1.visualizations.visualizations,
                ...res2.visualizations.visualizations,
                ...res3.visualizations.visualizations,
                ...res4.visualizations.visualizations,
            ])
        }
        cascadingFetch()
    }, [])

    return (
        <>
            <h2>Visualizations</h2>
            <ul>
                {vizList.map(({ id, name }) => (
                    <li key={id}>{name}</li>
                ))}
            </ul>
        </>
    )
}
