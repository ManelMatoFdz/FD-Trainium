const getModuleState = (state) => state.routines;

export const getList = (state) => getModuleState(state).list;
export const getCurrent = (state) => getModuleState(state).current;
export const getCategories = state => getModuleState(state).categories;
export const getSearchResults = state => getModuleState(state).searchResults;
