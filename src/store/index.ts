import { configureStore } from '@reduxjs/toolkit'
import authenticationReducer from './reducers/authentication.reducer'

export const index = configureStore({
  reducer: {
    authentication: authenticationReducer
  }
})

export type RootState = ReturnType<typeof index.getState>
export type AppDispatch = typeof index.dispatch
