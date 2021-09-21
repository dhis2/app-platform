/* global expect */

import { first, next, previous } from '../stepIterator';

const GET_INGREDIENTS = 'get ingredients';
const COOK_INGREDIENTS = 'cook ingredients';
const SERVE_BACALAO = 'serve the finished bacalao';

const bacalaoSteps = [
    {
        key: GET_INGREDIENTS,
    },
    {
        key: COOK_INGREDIENTS,
    },
    {
        key: SERVE_BACALAO,
    },
];

describe('Step iterator', () => {
    describe('next', () => {
        test('should return the next item when current item is not last', () => {
            const actualStep = next(bacalaoSteps, COOK_INGREDIENTS);
            expect(actualStep).toBe(SERVE_BACALAO);
        });

        test('should return the same item when current item is last', () => {
            const actualStep = next(bacalaoSteps, SERVE_BACALAO);
            expect(actualStep).toBe(SERVE_BACALAO);
        });
    });

    describe('previous', () => {
        test('should return the previous item when current item is not first', () => {
            const actualStep = previous(bacalaoSteps, COOK_INGREDIENTS);
            expect(actualStep).toBe(GET_INGREDIENTS);
        });


        test('should return the same item when current item is first', () => {
            const actualStep = previous(bacalaoSteps, GET_INGREDIENTS);
            expect(actualStep).toBe(GET_INGREDIENTS);
        });
    });

    describe('first', () => {
        test('should return the first item', () => {
            const actualStep = first(bacalaoSteps);
            expect(actualStep).toBe(GET_INGREDIENTS);
        });
    });
});
