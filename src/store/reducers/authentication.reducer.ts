import {
  AuthenticationActionTypes,
  SET_AUTH_STATE
} from '../actions/authentication.actions'
import {
  AuthenticationState,
  AuthenticationStatus
} from '@components/Authentication/authentication.types'

const initialState: AuthenticationState = {
  authenticationStatus: AuthenticationStatus.NOT_AUTHENTICATED
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
    default:
      return state
  }
}
