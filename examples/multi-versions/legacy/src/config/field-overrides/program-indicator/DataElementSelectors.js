import React from 'react';
import componentFromStream from 'recompose/componentFromStream';
import branch from 'recompose/branch';
import renderNothing from 'recompose/renderNothing';
import { compose, memoize, getOr, values, get, isNil } from 'lodash/fp';
import { Observable } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import CircularProgress from 'material-ui/CircularProgress/CircularProgress';
import CollapsibleLists from './CollapsibleLists';

const getAvailableDataElementsForProgram = memoize(program => Observable.fromPromise(getInstance())
        .mergeMap(memoize(d2 => d2.models.programStages
            .filter().on('program.id').equals(program)
            .list({ fields: 'id,displayName,programStageDataElements[id,dataElement[id,displayName]' })
        )));

const DataElementSelectors = componentFromStream(props$ => props$
    .flatMap(({ program, ...props }) => getAvailableDataElementsForProgram(program)
            .map((programStageCollection) => {
                const programStages = programStageCollection.toArray();

                const availableDataElements = programStages
                    .map((programStage) => {
                        const programStageDataElements = compose(values, getOr([], 'programStageDataElements'))(programStage);

                        return {
                            label: programStage.displayName,
                            items: programStageDataElements
                                .map(({ dataElement }) => ({
                                    label: dataElement.displayName,
                                    value: `#{${programStage.id}.${dataElement.id}}`,
                                })),
                        };
                    });

                return ({
                    ...props,
                    listSources: availableDataElements,
                });
            }))
    .map(props => (<CollapsibleLists {...props} />))
    .startWith(<CircularProgress />)
);

const hasMissingProgram = compose(isNil, get('program'));

// Render nothing if no program has been chosen
export default branch(hasMissingProgram, renderNothing)(DataElementSelectors);
