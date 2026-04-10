import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'reduxjs-toolkit-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combinedReducers } from './slices'


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['persistSlice'],
}

const persistedReducer = persistReducer(persistConfig, combinedReducers)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

const persistor = persistStore(store);

export { store, persistor }