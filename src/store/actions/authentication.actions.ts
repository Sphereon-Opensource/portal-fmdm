import { AuthenticationStatus } from '@components/Authentication/authentication.types'

export const SET_AUTH_STATE = 'SET_AUTH_STATE'

interface SetAuthStateAction {
  type: typeof SET_AUTH_STATE
  payload: AuthenticationStatus
}

export type AuthenticationActionTypes = SetAuthStateAction

export const setAuthState = (
  authState: AuthenticationStatus
): SetAuthStateAction => ({
  type: SET_AUTH_STATE,
  payload: authState
})

export const logout = () => {
  return setAuthState(AuthenticationStatus.NOT_AUTHENTICATED)
}
