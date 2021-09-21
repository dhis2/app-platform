import { getMissingFields } from '../getMissingValuesForModelName';

describe('Get missing required form fields', function() {
    const fieldRules = {
        name: { required: true },
        shortName: { required: true },
        description: { required: false },
    };
    const fields = [
        'name',
        'shortName',
        'description',
    ];

    it('should return an empty array when the required data is present', function() {
        const values = { name: 'foo', shortName: 'bar' };
        const expected = [];
        const actual = getMissingFields(values, fields, fieldRules);

        expect(actual).toEqual(expected);
    });

    it('should return an array with the missing fields when data is insufficiant', function() {
        const values = { name: 'foo' };
        const expected = ['shortName'];
        const actual = getMissingFields(values, fields, fieldRules);

        expect(actual).toEqual(expected);
    });
    
});

