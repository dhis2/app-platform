import Store from 'd2-ui/lib/store/Store';

export const optionDialogStore = Store.create();
export const sortDialogStore = Store.create({
    getInitialState() {
        return {};
    },
});

export const optionsForOptionSetStore = Store.create({
    getInitialState() {
        return {
            isLoading: true,
            options: [],
        };
    },
});
