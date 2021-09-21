import { TabBar } from '@dhis2/ui-core'
import { useSelector } from 'react-redux'
import React from 'react'
import cx from 'classnames'
import { GroupEditorLink } from './GroupEditorLink'
import { NavigationLink } from './NavigationLink'
import { groupOrder } from '../../config'
import { getNavigationDisabled } from '../../redux'

export const Navigation = () => {
    const disabled = useSelector(getNavigationDisabled)

    return (
        <nav className={cx({ disabled })}>
            <TabBar scrollable>
                <NavigationLink
                    noAuth
                    id="all"
                    to="/list/all"
                    label={'All'}
                    disabled={disabled}
                />

                {groupOrder.map(group => (
                    <NavigationLink
                        key={group.key}
                        id={group.key}
                        to={`/list/${group.key}Section`}
                        group={group}
                        label={group.name}
                        disabled={disabled}
                    />
                ))}

                <GroupEditorLink disabled={disabled} />
            </TabBar>
        </nav>
    )
}
