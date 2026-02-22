import {combineReducers} from 'redux';

import app from '../modules/app';
import users from '../modules/users';
//Routines Reducer
import routines from '../modules/routines';
import exercises from '../modules/exercises';


const rootReducer = combineReducers({
    app: app.reducer,
    users: users.reducer,
    routines: routines.reducer,
    exercises: exercises.reducer

});

export default rootReducer;