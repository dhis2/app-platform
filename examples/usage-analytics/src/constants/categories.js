import i18n from '@dhis2/d2-i18n'

export const FAVORITE_VIEWS = 'FAVORITE_VIEWS'
export const FAVORITES_SAVED = 'FAVORITES_SAVED'
export const USERS = 'USERS'
export const TOP_FAVORITES = 'TOP_FAVORITES'
export const DATA_VALUES = 'DATA_VALUES'

export const CATEGORY_LOOKUP = {
    [FAVORITE_VIEWS]: {
        value: FAVORITE_VIEWS,
        label: i18n.t('Favorite views'),
        subtitle: i18n.t('Number of times users looked at analysis favorites'),
    },
    [FAVORITES_SAVED]: {
        value: FAVORITES_SAVED,
        label: i18n.t('Favorites saved'),
        subtitle: i18n.t('Number of analysis favorites created by users'),
    },
    [USERS]: {
        value: USERS,
        label: i18n.t('Users'),
        subtitle: i18n.t('Number of users in the system'),
    },
    [TOP_FAVORITES]: {
        value: TOP_FAVORITES,
        label: i18n.t('Top favorites'),
    },
    [DATA_VALUES]: {
        value: DATA_VALUES,
        label: i18n.t('Data values'),
        subtitle: i18n.t('Number of data values saved in the system'),
    },
}

const CATEGORIES = [
    CATEGORY_LOOKUP.FAVORITE_VIEWS,
    CATEGORY_LOOKUP.FAVORITES_SAVED,
    CATEGORY_LOOKUP.USERS,
    CATEGORY_LOOKUP.TOP_FAVORITES,
    CATEGORY_LOOKUP.DATA_VALUES,
]
export default CATEGORIES
