import * as actionTypes from './actionTypes';

export const findAllCompleted = (items) => ({
  type: actionTypes.FIND_ALL_COMPLETED,
  items,
});

export const findByIdCompleted = (item) => ({
  type: actionTypes.FIND_BY_ID_COMPLETED,
  item,
});

export const clearCurrent = () => ({ type: actionTypes.CLEAR_CURRENT });

export const saveCompleted = (item) => ({
  type: actionTypes.SAVE_COMPLETED,
  item,
});

export const deleteCompleted = (id) => ({
  type: actionTypes.DELETE_COMPLETED,
  id,
});

export const setLoading = (loading) => ({
  type: actionTypes.SET_LOADING,
  loading,
});

export const updateCompleted = (item) => ({
  type: actionTypes.UPDATE_COMPLETED,
  item,
});

