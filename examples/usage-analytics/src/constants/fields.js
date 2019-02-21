import * as CATS from './categories'
import * as AGGREG from './aggregations'
import * as CHARTS from './chartTypes'
import * as PROPS from './properties'

const FAVORITE_VIEWS_SUM_FIELDS = [
    PROPS.mapViews,
    PROPS.chartViews,
    PROPS.pivotTableViews,
    PROPS.eventReportViews,
    PROPS.eventChartViews,
    PROPS.dashboardViews,
    PROPS.dataSetReportViews,
]

const FAVORITE_VIEWS_AVG_FIELDS = [
    PROPS.averageMapViews,
    PROPS.averageChartViews,
    PROPS.averagePivotTableViews,
    PROPS.averageEventReportViews,
    PROPS.averageEventChartViews,
    PROPS.averageDashboardViews,
]

const FAVORITES_SAVED_FIELDS = [
    PROPS.savedMaps,
    PROPS.savedCharts,
    PROPS.savedPivotTables,
    PROPS.savedEventReports,
    PROPS.savedEventCharts,
    PROPS.savedDashboards,
    PROPS.savedIndicators,
]

const USERS_FIELDS = [PROPS.activeUsers, PROPS.users]

export const TABLE_FIELDS = {
    [CATS.FAVORITE_VIEWS]: {
        [AGGREG.SUM]: [
            PROPS.date,
            ...FAVORITE_VIEWS_SUM_FIELDS,
            PROPS.totalViews,
        ],
        [AGGREG.AVERAGE]: [
            PROPS.date,
            ...FAVORITE_VIEWS_AVG_FIELDS,
            PROPS.averageViews,
        ],
    },
    [CATS.FAVORITES_SAVED]: [PROPS.date, ...FAVORITES_SAVED_FIELDS],
    [CATS.USERS]: [PROPS.date, ...USERS_FIELDS],
    [CATS.TOP_FAVORITES]: [
        PROPS.position,
        PROPS.name,
        PROPS.views,
        PROPS.id,
        PROPS.created,
    ],
    [CATS.DATA_VALUES]: [PROPS.date, PROPS.savedDataValues],
}

export const CHART_FIELDS = {
    [CATS.FAVORITE_VIEWS]: {
        [AGGREG.SUM]: {
            [CHARTS.ALL]: FAVORITE_VIEWS_SUM_FIELDS,
            [CHARTS.TOTAL]: [PROPS.totalViews],
        },
        [AGGREG.AVERAGE]: {
            [CHARTS.ALL]: FAVORITE_VIEWS_AVG_FIELDS,
            [CHARTS.TOTAL]: [PROPS.averageViews],
        },
    },
    [CATS.FAVORITES_SAVED]: FAVORITES_SAVED_FIELDS,
    [CATS.USERS]: USERS_FIELDS,
    [CATS.DATA_VALUES]: [PROPS.savedDataValues],
}
