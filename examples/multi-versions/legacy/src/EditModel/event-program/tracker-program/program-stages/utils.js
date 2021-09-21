import mapPropsStream from 'recompose/mapPropsStream';
import programStore$ from '../../eventProgramStore';
import { get, first, compose } from 'lodash/fp';

const program$ = programStore$.map(get('program'));

const programStages$ = programStore$.map(get('programStages'));

const getFirstProgramStage = compose(first, get('programStages'));
export const firstProgramStage$ = programStore$.map(getFirstProgramStage);

/**
 * Maps the programStage$ observable to a normal object to read the values in the component.
 */
export const withProgramStageFromProgramStage$ = mapPropsStream(props$ =>
    props$.combineLatest(
        props$.flatMap(x => x.programStage$),
        (props, programStage) => ({
            ...props,
            programStage,
        }),
    ),
);

/**
 * Adds program and programStages as props to the enhanced components.
 */

export const withProgramAndStages = compose(
    mapPropsStream(props$ =>
        props$.combineLatest(
            program$,
            programStages$,
            (props, program, programStages) => ({
                ...props,
                program,
                programStages,
            }),
        ),
    ),
);

export const getProgramStageById$ = stageId =>
    programStages$
        .flatMap(x => x)
        .filter(stage => stage.id && stage.id === stageId);

// Use programStage$ prop if present, else use first programStage
export const getProgramStageOrFirstFromProps$ = props$ =>
    props$
        .take(1)
        .flatMap(
            props =>
                (props.programStage$
                    ? props.programStage$
                    : programStore$.map(getFirstProgramStage)),
        );
