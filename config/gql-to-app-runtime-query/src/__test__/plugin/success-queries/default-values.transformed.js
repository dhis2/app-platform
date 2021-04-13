import { gql } from '@dhis2/app-runtime';
const query = {
  SmsCommand: {
    resource: "smsCommands",
    params: ({
      test = "test"
    }) => ({
      fields: ["*"],
      test: test
    })
  }
};
