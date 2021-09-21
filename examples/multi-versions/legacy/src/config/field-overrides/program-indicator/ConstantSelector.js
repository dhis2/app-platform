import mapPropsStream from 'recompose/mapPropsStream';
import { noop } from 'lodash/fp';
import { getAllObjectsWithFields } from 'd2-ui/lib/data-helpers';
import { Observable } from 'rxjs';
import CollapsibleList from './CollapsibleList';

const withConstantProps = mapPropsStream(props$ => props$
    .combineLatest(
        Observable.fromPromise(getAllObjectsWithFields('constant'))
            .startWith([]),
        ({ onSelect = noop, ...props }, constants) => ({
            ...props,
            items: constants
                .map(constant => ({
                    value: `C{${constant.id}}`,
                    label: constant.displayName,
                })),
            onItemClick: onSelect,
        })
    )
);

const ConstantSelector = withConstantProps(CollapsibleList);

export default ConstantSelector;
