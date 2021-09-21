/**
 * There are enums in this file which are not exposed over the schemas
 * and need to correspond to the enums in the Java implementation. This
 * should be refactored so that the backend exposes the values to the
 * client along with the schema so the client does not need to maintain
 * a list of valid properties towards the backend.
 *
 * The enums can be found in `dhis2-core`:
 * - AnalyticsPeriodBoundary.java
 * - AnalyticsPeriodBoundaryType.java
 *
 * In addition to this, now users can use custom free-text boundary
 * targets.
 */

export const BEFORE_START_OF_REPORTING_PERIOD = 'BEFORE_START_OF_REPORTING_PERIOD';
export const BEFORE_END_OF_REPORTING_PERIOD = 'BEFORE_END_OF_REPORTING_PERIOD';
export const AFTER_START_OF_REPORTING_PERIOD = 'AFTER_START_OF_REPORTING_PERIOD';
export const AFTER_END_OF_REPORTING_PERIOD = 'AFTER_END_OF_REPORTING_PERIOD';
export const INCIDENT_DATE = 'INCIDENT_DATE';
export const EVENT_DATE = 'EVENT_DATE';
export const ENROLLMENT_DATE = 'ENROLLMENT_DATE';
export const CUSTOM= 'CUSTOM';
