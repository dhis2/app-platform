import { Subject } from 'rxjs';
import log from 'loglevel';

const ObservedEvents = {
    getInitialState() {
        this.events = {};
        this.eventSubjects = {};

        return {};
    },

    createEventObserver: (function createEventObserver() {
        const subjectMap = new Map();

        return function ObservedEventHandler(referenceName) {
            let subject;

            if (!subjectMap.has(referenceName)) {
                subject = new Subject();
                subjectMap.set(referenceName, subject);
            } else {
                subject = subjectMap.get(referenceName);
            }

            if (!this.events[referenceName]) {
                // Run a map that keeps a copy of the event
                this.events[referenceName] = subject.map(event => Object.assign({}, event));
            }

            return (event) => {
                subject.next(event);
            };
        };
    }()),

    componentWillUnmount() {
        // Complete any eventsSubjects
        Object.keys(this.eventSubjects).forEach((eventSubjectKey) => {
            log.debug(`Completing: ${[this.constructor.name, eventSubjectKey].join('.')}`);
            this.eventSubjects[eventSubjectKey].completed();
        });
    },
};

export default ObservedEvents;
