import React from 'react'
import classes from './App.module.css'
import SectionWrapper from './components/SectionWrapper'

const MyApp = () => (
    <div className={classes.container}>
        <SectionWrapper id={'section-id-01'} />
    </div>
)

export default MyApp
