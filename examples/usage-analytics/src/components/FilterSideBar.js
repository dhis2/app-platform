import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import i18n from '@dhis2/d2-i18n'
import * as Fields from './FilterFields'
import { FAVORITE_VIEWS, TOP_FAVORITES } from '../constants/categories'
import './FilterSideBar.css'

export function FilterSideBar({
    showDateFields,
    showFavoriteViewsFields,
    showTopFavoritesFields,
}) {
    return (
        <aside className="uaa-filter-sidebar">
            <h1 className="uaa-app-header">{i18n.t('Usage Analytics')}</h1>
            <Fields.CategoryDropDown />
            {showDateFields && (
                <Fragment>
                    <Fields.DateRange />
                    <Fields.IntervalDropDown />
                </Fragment>
            )}
            {showFavoriteViewsFields && (
                <Fragment>
                    <Fields.AggregationLevelDropDown />
                    <Fields.ChartTypeDropDown />
                </Fragment>
            )}
            {showTopFavoritesFields && (
                <Fragment>
                    <Fields.EventTypeDropDown />
                    <Fields.PageSizeDropDown />
                    <Fields.SortOrderDropDown />
                </Fragment>
            )}
        </aside>
    )
}

FilterSideBar.propTypes = {
    showDateFields: PropTypes.bool,
    showFavoriteViewsFields: PropTypes.bool,
    showTopFavoritesFields: PropTypes.bool,
}

export function mapStateToProps({ filter: { category } }) {
    return {
        showDateFields: category !== TOP_FAVORITES,
        showTopFavoritesFields: category === TOP_FAVORITES,
        showFavoriteViewsFields: category === FAVORITE_VIEWS,
    }
}

export default connect(mapStateToProps)(FilterSideBar)
