import { get, getOr, compose, first, filter, identity } from 'lodash/fp';

const extractFirstMessageFromErrorReports = compose(get('message'), first, getOr([], 'errorReports'), get('response'));

const extractFirstMessageFromMessages = compose(get('message'), first, get('messages'));

const firstNotUndefinedIn = compose(first, filter(identity));

export default function extractFirstErrorMessageFromServer(response) {
    const messages = [
        extractFirstMessageFromErrorReports(response),
        extractFirstMessageFromMessages(response),
    ];

    return firstNotUndefinedIn(messages);
}
