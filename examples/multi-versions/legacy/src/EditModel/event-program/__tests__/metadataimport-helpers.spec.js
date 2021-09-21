import { getImportStatus } from '../metadataimport-helpers';

describe('MetaDataImport helpers', () => {
    let successfullImportResponse;
    let unsuccessfullImportResponse;

    beforeEach(() => {
        successfullImportResponse = {
            importParams: {
                importMode: 'COMMIT',
                identifier: 'UID',
                preheatMode: 'REFERENCE',
                importStrategy: 'CREATE_AND_UPDATE',
                atomicMode: 'ALL',
                mergeMode: 'REPLACE',
                flushMode: 'AUTO',
                skipSharing: false,
                skipValidation: false,
                username: 'admin',
            },
            status: 'OK',
            stats: {
                created: 1,
                updated: 0,
                deleted: 0,
                ignored: 0,
                total: 1,
            },
            typeReports: [
                {
                    klass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                    stats: {
                        created: 1,
                        updated: 0,
                        deleted: 0,
                        ignored: 0,
                        total: 1,
                    },
                },
            ],
        };

        unsuccessfullImportResponse = {
            importParams: {
                importMode: 'COMMIT',
                identifier: 'UID',
                preheatMode: 'REFERENCE',
                importStrategy: 'CREATE_AND_UPDATE',
                atomicMode: 'ALL',
                mergeMode: 'REPLACE',
                flushMode: 'AUTO',
                skipSharing: false,
                skipValidation: false,
                username: 'admin',
            },
            status: 'ERROR',
            stats: {
                created: 0,
                updated: 0,
                deleted: 0,
                ignored: 2,
                total: 2,
            },
            typeReports: [
                {
                    klass: 'org.hisp.dhis.program.Program',
                    stats: {
                        created: 0,
                        updated: 0,
                        deleted: 0,
                        ignored: 1,
                        total: 1,
                    },
                    objectReports: [
                        {
                            klass: 'org.hisp.dhis.program.Program',
                            index: 0,
                            uid: 'MslrqljzDcW',
                            errorReports: [
                                {
                                    message: 'Missing required property `name`.',
                                    mainKlass: 'org.hisp.dhis.program.Program',
                                    errorKlass: 'java.lang.String',
                                    errorProperty: 'name',
                                    errorCode: 'E4000',
                                },
                            ],
                        },
                    ],
                },
                {
                    klass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                    stats: {
                        created: 0,
                        updated: 0,
                        deleted: 0,
                        ignored: 1,
                        total: 1,
                    },
                    objectReports: [
                        {
                            klass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                            index: 0,
                            errorReports: [
                                {
                                    message: 'Property `code` with value `2222332` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                                    mainId: 'ucZp3aEMfR5',
                                    errorProperty: 'code',
                                    errorCode: 'E5003',
                                },
                                {
                                    message: 'Property `name` with value `234234` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                                    mainId: 'ucZp3aEMfR5',
                                    errorProperty: 'name',
                                    errorCode: 'E5003',
                                },
                                {
                                    message: 'Property `shortName` with value `2422` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                                    mainId: 'ucZp3aEMfR5',
                                    errorProperty: 'shortName',
                                    errorCode: 'E5003',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    });

    test('should return an object', () => {
        expect(typeof getImportStatus(successfullImportResponse)).toBe('object');
    });

    test('should retain the original properties on success', () => {
        expect(getImportStatus(successfullImportResponse).typeReports).toEqual(successfullImportResponse.typeReports);
        expect(getImportStatus(successfullImportResponse).stats).toEqual(successfullImportResponse.stats);
        expect(getImportStatus(successfullImportResponse).importParams).toEqual(successfullImportResponse.importParams);
        expect(getImportStatus(successfullImportResponse).status).toEqual(successfullImportResponse.status);
    });

    test('should retain the original properties on failure', () => {
        expect(getImportStatus(unsuccessfullImportResponse).typeReports).toEqual(unsuccessfullImportResponse.typeReports);
        expect(getImportStatus(unsuccessfullImportResponse).stats).toEqual(unsuccessfullImportResponse.stats);
        expect(getImportStatus(unsuccessfullImportResponse).importParams).toEqual(unsuccessfullImportResponse.importParams);
        expect(getImportStatus(unsuccessfullImportResponse).status).toEqual(unsuccessfullImportResponse.status);
    });

    describe('isOk', () => {
        test('should be a function', () => {
            expect(typeof getImportStatus(successfullImportResponse).isOk).toBe('function');
        });

        test('should return true when the import is successful', () => {
            expect(getImportStatus(successfullImportResponse).isOk()).toBe(true);
        });

        test('should return false when the import errored', () => {
            expect(getImportStatus(unsuccessfullImportResponse).isOk()).toBe(false);
        });
    });

    describe('typeReports', () => {
        test('should have a type report for each object on success', () => {
            expect(getImportStatus(successfullImportResponse).typeReports).toHaveLength(1);
        });

        test('should have a type report for each object on failure', () => {
            expect(getImportStatus(unsuccessfullImportResponse).typeReports).toHaveLength(2);
        });
    });

    describe('errorsPerObject', () => {
        test('should be an empty array on successful import', () => {
            expect(getImportStatus(successfullImportResponse).errorsPerObject).toEqual([]);
        });

        test('should contain an object for each object that has errors', () => {
            expect(getImportStatus(unsuccessfullImportResponse).errorsPerObject).toHaveLength(2);
        });

        test('should have the id for the program object', () => {
            expect(getImportStatus(unsuccessfullImportResponse).errorsPerObject[0].id).toBe('MslrqljzDcW');
        });

        // TODO: The id a categoryOption can not be retrieved in a reliable way
        xit('should have the id for the categoryOption object', () => {
            expect(getImportStatus(unsuccessfullImportResponse).errorsPerObject[1].id).toBe('Jg6u9usyKgl');
        });

        test('should have the errors group by property', () => {
            expect(getImportStatus(unsuccessfullImportResponse).errorsPerObject[1].errors).toEqual({
                code: [{
                    message: 'Property `code` with value `2222332` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                    mainId: 'ucZp3aEMfR5',
                    errorProperty: 'code',
                    errorCode: 'E5003',
                }],
                name: [{
                    message: 'Property `name` with value `234234` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                    mainId: 'ucZp3aEMfR5',
                    errorProperty: 'name',
                    errorCode: 'E5003',
                }],
                shortName: [{
                    message: 'Property `shortName` with value `2422` on object 234234 [Jg6u9usyKgl] (DataElementCategoryOption) already exists on object ucZp3aEMfR5.',
                    mainKlass: 'org.hisp.dhis.dataelement.DataElementCategoryOption',
                    mainId: 'ucZp3aEMfR5',
                    errorProperty: 'shortName',
                    errorCode: 'E5003',
                }],
            });
        });
    });
});
