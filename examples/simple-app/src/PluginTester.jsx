// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import React from 'react'
import styles from './App.module.css'

const Block = () => (
    <div
        style={{
            height: 40,
            width: 40,
            color: 'lightblue',
            border: '1px dashed grey',
        }}
    />
)

const pSrc = 'http://localhost:3000/plugin.html'

const PluginTester = () => {
    const [flexContainerHeight, setFlexContainerHeight] = React.useState(333)

    return (
        <div>
            {/* 1. Container-driven default */}
            <p>
                Container-driven default. Expectation: fills container width,
                height = content height. A wrapper div is needed to make margins
                work the same as width = auto. Decided not to build that into
                the plugin component since it affects flex behavior
            </p>
            <div className={styles.margin}>
                <Plugin pluginSource={pSrc} />
            </div>

            {/* 2. Height = 100% */}
            {/* Currently working */}
            <p>
                Height 100%. Expectation: iframe fills container; content
                scrolls if it gets bigger than iframe
            </p>
            <div
                style={{
                    height: 333,
                    margin: '0 3rem',
                    border: '1px dotted black',
                }}
            >
                <Plugin pluginSource={pSrc} height="100%" />
            </div>

            {/* 3. Fixed width & height */}
            {/* Currently working */}
            <p>
                Fixed width and height. Expectation: content in plugin scrolls
                if it&apos;s bigger than iframe
            </p>
            <Plugin pluginSource={pSrc} height="222px" width="444px" />

            {/* 4. Content-driven option */}
            <p>
                Content-driven size. Expectation: width is defined by content;
                iframe grows and shrinks
            </p>
            <Plugin
                pluginSource={pSrc}
                clientWidth="max-content"
            />

            {/* 5. Flex horizontal */}
            {/* Currently working */}
            <p>
                Flex horizontal. Expectation: iframe resizes according to flex
                container
            </p>
            <div style={{ display: 'flex', height: '200px' }}>
                <Block />
                <Block />
                <Plugin
                    pluginSource={pSrc}
                    height="100%"
                    className={styles.flexGrow}
                />
                <Block />
                <Block />
            </div>

            {/* 6. Flex vertical */}
            {/* Currently working; height is still getting set by the resize observer, but className styles are overriding them */}
            <p>
                Flex vertical. Expectation: iframe resizes vertically according
                to flex container height
            </p>
            <div
                className={styles.verticalFlexContainer}
                style={{ height: flexContainerHeight }}
            >
                <button
                    onClick={() =>
                        setFlexContainerHeight((current) =>
                            current === 666 ? 333 : 666
                        )
                    }
                >
                    Change container height
                </button>
                <Block />
                <Block />
                <Plugin pluginSource={pSrc} className={styles.flexGrow} />
                <Block />
                <Block />
            </div>
        </div>
    )
}

export default PluginTester
