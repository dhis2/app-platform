import * as utils from '../dataEntryFormUtils';

describe('dataEntryFormUtils', () => {
    let elements;
    const initialHTML =
        '<p><input id="ZzYYXq4fJie-FqlgKAG8HOu-val" name="entryfield" title="MCH Measles dose" value="[ MCH Measles dose ]"/><input id="ZzYYXq4fJie-hDZbpskhqDd-val" name="entryfield" title="MCH HIV Test Type" value="[ MCH HIV Test Type ]"/><input id="ZzYYXq4fJie-BeynU4L6VCQ-val" name="entryfield" title="MCH Results given to caretaker" value="[ MCH Results given to caretaker ]"/></p>';
    beforeEach(() => {
        elements = {
            'ZzYYXq4fJie-sj3j9Hwc7so-val': 'MCH Child ARVs',
            'ZzYYXq4fJie-pOe0ogW4OWd-val': 'MCH DPT dose',
            'ZzYYXq4fJie-hDZbpskhqDd-val': 'MCH HIV Test Type',
            'ZzYYXq4fJie-X8zyunlgUfM-val': 'MCH Infant Feeding',
            'ZzYYXq4fJie-cYGaxwK615G-val': 'MCH Infant HIV Test Result',
            'ZzYYXq4fJie-GQY2lXrypjO-val': 'MCH Infant Weight  (g)',
            'ZzYYXq4fJie-lNNb3truQoi-val': 'MCH IPT dose',
            'ZzYYXq4fJie-FqlgKAG8HOu-val': 'MCH Measles dose',
            'ZzYYXq4fJie-vTUhAUZFoys-val': 'MCH Penta dose',
            'ZzYYXq4fJie-BeynU4L6VCQ-val': 'MCH Results given to caretaker',
            'ZzYYXq4fJie-aei1xRjSU2l-val': 'MCH Septrin Given',
            'ZzYYXq4fJie-OuJ6sgPyAbC-val': 'MCH Visit Comment',
            'ZzYYXq4fJie-HLmTEmupdX0-val': 'MCH Vit A',
            'ZzYYXq4fJie-rxBfISxXS2U-val': 'MCH Yellow fever dose',
        };
    });

    describe('processForm()', () => {
        test('it should work with empty formData', () => {
            const dataEntryForm = '';
            const { usedIds, outHtml } = utils.processFormData(
                dataEntryForm,
                elements,
            );
            expect(outHtml).toBe(dataEntryForm)
            expect(usedIds.length).toBe(0)
        });

        test('it should work with elements', () => {
            const dataEntryForm = initialHTML;
            const { usedIds, outHtml } = utils.processFormData(
                dataEntryForm,
                elements,
                utils.elementPatterns.combinedIdPattern
            );
            expect(outHtml).toBe(initialHTML)
            expect(usedIds.length).toBe(3)
        });

        test('it should work with input elements that do not have attribute id', () => {
            const html = initialHTML + '<input type="button" id="a-button">'
            const { usedIds, outHtml } = utils.processFormData(
                html,
                elements,
            );
            expect(outHtml).toBe(html)
        })
    });

});
