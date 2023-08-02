import { configureStore } from '@reduxjs/toolkit'
import authenticationReducer from './reducers/authentication.reducer'

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export default store
// export type AppDispatch = typeof index.dispatch
