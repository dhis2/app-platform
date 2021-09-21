export const getColumnsForModelType = (state, modelType) => {
    const m = state.configurableColumns.modelTypes[modelType];
    return m && m.columns || [];
};

export const getAllModelTypes = state => state.configurableColumns.modelTypes;

export const getDialogOpen = state => state.configurableColumns.dialog.open;
