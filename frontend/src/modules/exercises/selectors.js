const getModule = (state) => state.exercises;

export const getList    = (state) => getModule(state).list;
export const getCurrent = (state) => getModule(state).current;
export const isLoading  = (state) => getModule(state).loading;
