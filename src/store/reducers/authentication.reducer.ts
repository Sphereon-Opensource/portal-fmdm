import {
  AuthenticationActionTypes,
  CLOSE_LOGIN_MODAL,
  OPEN_LOGIN_MODAL,
  SET_AUTH_STATE
} from '../actions/authentication.actions'
import {
  AuthenticationState,
  AuthenticationStatus
} from '@components/Authentication/authentication.types'

const initialState: AuthenticationState = {
  authenticationStatus: AuthenticationStatus.NOT_AUTHENTICATED,
  loginModalOpen: false
}

export default function authenticationReducer(
  state = initialState,
  action: AuthenticationActionTypes
): AuthenticationState {
  switch (action.type) {
    case SET_AUTH_STATE:
      return {
        ...state,
        authenticationStatus: action.payload
      }
    case OPEN_LOGIN_MODAL:
      return {
        ...state,
        loginModalOpen: true
      }
    case CLOSE_LOGIN_MODAL:
      return {
        ...state,
        loginModalOpen: false
      }
    default:
      return state
  }
}
