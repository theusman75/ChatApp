import { combineReducers } from '@reduxjs/toolkit';
import persistSlice from './persist/persistSlice';


export const combinedReducers = combineReducers({
    persistSlice,
});