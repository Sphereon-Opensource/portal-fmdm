import { AuthenticationStatus } from '@components/Authentication/authentication.types'

export const SET_AUTH_STATE = 'SET_AUTH_STATE'
export const OPEN_LOGIN_MODAL = 'OPEN_LOGIN_MODAL'
export const CLOSE_LOGIN_MODAL = 'CLOSE_LOGIN_MODAL'

interface SetAuthStateAction {
  type: typeof SET_AUTH_STATE
  payload: AuthenticationStatus
}

interface OpenLoginModalAction {
  type: typeof OPEN_LOGIN_MODAL
}

interface CloseLoginModalAction {
  type: typeof CLOSE_LOGIN_MODAL
}

export type AuthenticationActionTypes =
  | SetAuthStateAction
  | OpenLoginModalAction
  | CloseLoginModalAction

export const setAuthState = (
  authState: AuthenticationStatus
): SetAuthStateAction => ({
  type: SET_AUTH_STATE,
  payload: authState
})

export const openLoginModal = (): OpenLoginModalAction => ({
  type: OPEN_LOGIN_MODAL
})

export const closeLoginModal = (): CloseLoginModalAction => ({
  type: CLOSE_LOGIN_MODAL
})

export const login = () => {
  // todo: fix this. this should be called inside each handler (wallet/oidc/siop)
  return setAuthState(AuthenticationStatus.OIDC)
}

export const logout = () => {
  // Change the payload based on your requirements
  return setAuthState(AuthenticationStatus.NOT_AUTHENTICATED)
}
