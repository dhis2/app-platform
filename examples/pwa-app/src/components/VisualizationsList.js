import { useDataEngine } from '@dhis2/app-runtime'
import React, { useState, useEffect } from 'react'

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
const wait = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

/**
 * Loads a list of visualizations in an incremental way to emulate the
 * incremental loading nature of dashboards and test out the service worker
 * "recording mode"
 */
export default function VisualizationsList() {
    const [vizList, setVizList] = useState([])
    const engine = useDataEngine()

    useEffect(() => {
        setVizList([])
        const cascadingFetch = async () => {
            for (let i = 0; i < 4; i++) {
                // wait 0ms, 250ms, 500ms, 750ms
                await wait(i * 250)

                const res = await engine.query(query, {
                    variables: { page: i + 1 },
                })

                setVizList((prev) =>
                    prev.concat(res.visualizations.visualizations)
                )
            }
        }
        cascadingFetch()
    }, [])

    return (
        <>
            <h2>Visualizations</h2>
            <div>
                <em>These will load incrementally</em>
            </div>
            <ul>
                {vizList.map(({ id, name }) => (
                    <li key={id}>{name}</li>
                ))}
            </ul>
        </>
    )
}
