import React from "react";

import {useSelector} from 'react-redux';
import users, {Login, SignUp, UpdateProfile, ChangePassword, Logout, ViewProfile} from '../../users';
import PublicProfile from '../../users/components/PublicProfile';

import { Route, Routes } from "react-router-dom";

import Home from "./Home";
import RoutineList from "../../routines/components/RoutineList";
import MyRoutineList from "../../routines/components/MyRoutineList";
import SavedRoutineList from "../../routines/components/SavedRoutineList";
import RoutineForm from "../../routines/components/RoutineForm";
import RoutineDetails from "../../routines/components/RoutineDetails";
import ExerciseList from "../../exercises/components/ExerciseList";
import ExerciseForm from "../../exercises/components/ExerciseForm";
import ExerciseDetails from "../../exercises/components/ExerciseDetails";
import PendingExerciseList from "../../exercises/components/PendingExerciseList";
import RoutineExecutionForm from "../../routines/components/RoutineExecutionForm";
import ExecutionsHistory from "../../routines/components/ExecutionsHistory";
import RoutineExecutionDetails from "../../routines/components/RoutineExecutionDetails";
import RoutineStatistics from "../../routines/components/RoutineStatistics";
import Feed from "../../routines/components/Feed";
import BlockedUsers from "../../users/components/BlockedUsers";
import ExerciseFollowerStats from "../../exercises/components/ExerciseFollowerStats";


const Body = () => {

  const loggedIn = useSelector(users.selectors.isLoggedIn);

  return (
    <Routes>
      <Route path="/*" element={<Home />} />
      {loggedIn && <Route path="/feed" element={<Feed />} />}
      {loggedIn && <Route path="/routines" element={<RoutineList />} />}
      {loggedIn && <Route path="/savedRoutines" element={<SavedRoutineList />} />}
      {loggedIn && <Route path="/routines/my" element={<MyRoutineList/>}/>}
      {loggedIn && <Route path="/routines/new" element={<RoutineForm />} />}
      {loggedIn && <Route path="/routines/:routineId" element={<RoutineDetails />} />}
      {loggedIn && <Route path="/routines/:routineId/execute" element={<RoutineExecutionForm />} />}
      {loggedIn && <Route path="/routines/:routineId/edit" element={<RoutineForm />} />}
      {loggedIn && <Route path="/routines/executions" element={<ExecutionsHistory />} />}
      {loggedIn && <Route path="/routines/statistics" element={<RoutineStatistics />} />}
      {loggedIn && <Route path="/routines/executions/:executionId" element={<RoutineExecutionDetails />} />}
      {loggedIn && <Route path="/users/view-profile" element={<ViewProfile />} />}
      {loggedIn && <Route path="/users/blocked" element={<BlockedUsers />} />}
      {loggedIn && <Route path="/users/update-profile" element={<UpdateProfile />} />}
      {loggedIn && <Route path="/users/change-password" element={<ChangePassword />} />}
      {loggedIn && <Route path="/users/logout" element={<Logout />} />}
      {loggedIn && <Route path="/users/:userId" element={<PublicProfile />} />}
      {loggedIn && <Route path="/exercises" element={<ExerciseList />} />}
      {loggedIn && <Route path="/exercises/pending" element={<PendingExerciseList />} />}
      {loggedIn && <Route path="/exercises/new" element={<ExerciseForm />} />}
      {loggedIn && <Route path="/exercises/:exerciseId/edit" element={<ExerciseForm />} />}
      {loggedIn && <Route path="/exercises/:exerciseId" element={<ExerciseDetails />} />}
      {loggedIn && <Route path="/exercises/stats" element={<ExerciseFollowerStats />} />}
      {!loggedIn && <Route path="/users/login" element={<Login />} />}
      {!loggedIn && <Route path="/users/signup" element={<SignUp />} />}
    </Routes>
  );
};

export default Body;
