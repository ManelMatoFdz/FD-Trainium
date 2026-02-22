import { combineReducers } from 'redux';
import * as actionTypes from './actionTypes';

const list = (state = [], action) => {
  switch (action.type) {
    case actionTypes.FIND_ALL_COMPLETED:
      return action.items;
    case actionTypes.SAVE_COMPLETED: {
      const exists = state.find((e) => e.id === action.item.id);
      return exists
        ? state.map((e) => (e.id === action.item.id ? action.item : e))
        : [action.item, ...state];
    }
    case actionTypes.DELETE_COMPLETED:
      return state.filter((e) => e.id !== action.id);
    case actionTypes.UPDATE_COMPLETED:
      return state.map((e) => (e.id === action.item.id ? action.item : e));
    default:
      return state;
  }
};

const current = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FIND_BY_ID_COMPLETED:
    case actionTypes.SAVE_COMPLETED:
      return action.item;
    case actionTypes.CLEAR_CURRENT:
      return null;
    case actionTypes.DELETE_COMPLETED:
      return state && state.id === action.id ? null : state;
    case actionTypes.UPDATE_COMPLETED:
      return action.item;

    default:
      return state;
  }
};

const loading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return action.loading;
    default:
      return state;
  }
};

export default combineReducers({ list, current, loading });
