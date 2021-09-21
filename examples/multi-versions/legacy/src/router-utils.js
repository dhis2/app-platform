import { history } from 'shared'

export function goToRoute(url) {
    history.push(url);
}

export function goToAndScrollUp(url) {
    goToRoute(url);
    global.scrollTo && global.scrollTo(0, 0);
}

export function goBack() {
    history.goBack();
}

/**
 * @param {Object} query
 */
export const addQuery = (query) => {
    const location = Object.assign({}, history.getCurrentLocation());
    Object.assign(location.query, query);
    history.push(location);
};

/**
 * @param {...String} queryNames
 */
export const removeQuery = (...queryNames) => {
    const location = Object.assign({}, history.getCurrentLocation());
    queryNames.forEach(q => delete location.query[q]);
    history.push(location);
};
