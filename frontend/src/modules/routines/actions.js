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

export const findAllCategoriesCompleted = (categories) => ({
    type: actionTypes.FIND_ALL_CATEGORIES_COMPLETED,
    categories
});

export const searchRoutinesCompleted = (searchResults) => ({
    type: actionTypes.SEARCH_ROUTINES_COMPLETED,
    searchResults
});

export const SavedUsersCompleted = (users) => ({
    type: actionTypes.SAVED_USERS_COMPLETED,
    users
});

export const followCreatorCompleted = (routineId) => ({
    type: actionTypes.FOLLOW_CREATOR_COMPLETED,
    routineId
});

export const unfollowCreatorCompleted = (routineId) => ({
    type: actionTypes.UNFOLLOW_CREATOR_COMPLETED,
    routineId
});

export const isFollowingCreatorCompleted = (routineId, isFollowing) => ({
    type: actionTypes.IS_FOLLOWING_CREATOR_COMPLETED,
    routineId,
    isFollowing
});
