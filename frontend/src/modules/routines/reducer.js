import { combineReducers } from 'redux';
import * as actionTypes from './actionTypes';

const initialState = {
  list: [],
  current: null,
  categories: [],
  searchResults: {
    items: [],
    existMoreItems: false,
  },
    savedUsers: [],
    isFollowing: {},
};

const list = (state = initialState.list, action) => {
  switch (action.type) {
    case actionTypes.FIND_ALL_COMPLETED:
      return action.items;
    case actionTypes.SAVE_COMPLETED: {
      const exists = state.find((r) => r.id === action.item.id);
      if (exists) {
        return state.map((r) => (r.id === action.item.id ? action.item : r));
      }
      return [action.item, ...state];
    }
    case actionTypes.DELETE_COMPLETED:
      return state.filter((r) => r.id !== action.id);
    default:
      return state;
  }
};

const current = (state = initialState.current, action) => {
  switch (action.type) {
    case actionTypes.FIND_BY_ID_COMPLETED:
    case actionTypes.SAVE_COMPLETED:
      return action.item;
    case actionTypes.CLEAR_CURRENT:
      return null;
    case actionTypes.DELETE_COMPLETED:
      return state && state.id === action.id ? null : state;
      case actionTypes.IS_FOLLOWING_CREATOR_COMPLETED:
          return {
              ...state,
              isFollowing: {
                  [action.routineId]: action.isFollowing,
              },
          };

      case actionTypes.FOLLOW_CREATOR_COMPLETED:
          return {
              ...state,
              isFollowing: {
                  [action.routineId]: true,
              },
          };

      case actionTypes.UNFOLLOW_CREATOR_COMPLETED:
          return {
              ...state,
              isFollowing: {
                  [action.routineId]: false,
              },
          };
    default:
      return state;
  }
};

const categories = (state = initialState.categories, action) => {
    if (action.type === actionTypes.FIND_ALL_CATEGORIES_COMPLETED) {
        return action.categories;
    }
    return state;

}

const searchResults = (state = initialState.searchResults, action) => {
    if (action.type === actionTypes.SEARCH_ROUTINES_COMPLETED) {
        return action.searchResults;
    }
    return state;
}

const savedUsers = (state = initialState.savedUsers, action) => {
    if (action.type === actionTypes.SAVED_USERS_COMPLETED) {
        return action.users || [];
    }
    return state;
};

const reducer = combineReducers({ list, current, categories, searchResults, savedUsers });

export default reducer;
