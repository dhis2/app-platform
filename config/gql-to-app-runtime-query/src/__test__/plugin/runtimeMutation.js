import { gql } from '@dhis2/app-runtime';
const query = {
  SmsCommand: {
    resource: "smsCommands",
    id: ({
      id
    }) => id,
    params: ({
      id,
      test = "test",
      int = 42,
      float = 42.42,
      bool,
      foo,
      bar
    }) => ({
      fields: "*,displayName,dataset[id,displayName,dataSetElements[dataElement[id,displayName,categoryCombo[categoryOptionCombos[id,displayName,code]]]]]",
      test: test,
      paging: "false",
      int: int,
      int2: 42,
      float: float,
      floats: 13.37,
      bool: bool,
      bools: true,
      obj: {
        key1: "str",
        key2: 42,
        key3: {
          key4: bar
        }
      },
      array: [{
        arrKey1: "arrVal1",
        arrKey2: "arrVal2"
      }, "arr1", "arr2", ["arr3.1", "arr3.2"]]
    }),
    data: ({
      id,
      test = "test",
      int = 42,
      float = 42.42,
      bool,
      foo,
      bar
    }) => ({
      foo: foo,
      bar: {
        baz: "foobar"
      }
    }),
    other: {
      foo: "foo",
      bar: {
        baz: "baz"
      }
    }
  },
  sms: {
    resource: "sms/outbound",
    pageSize: pageSize,
    page: page,
    order: "date:desc",
    filter: filter
  }
};
