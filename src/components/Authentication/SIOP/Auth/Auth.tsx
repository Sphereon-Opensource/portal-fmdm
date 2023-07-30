import styles from './Auth.module.css'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AuthenticationStatus } from '../../authentication.types'
import {
  login,
  logout,
  openLoginModal
} from '../../../../store/actions/authentication.actions'
import { RootState } from '../../../../store'

export default function Auth() {
  const dispatch = useDispatch()
  const authenticationState = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )
  const handleLogin = () => {
    dispatch(login())
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  if (
    authenticationState === AuthenticationStatus.NOT_AUTHENTICATED ||
    authenticationState === AuthenticationStatus.SIOP
  ) {
    return (
      <button
        className={`${styles.button} ${styles.initial}`}
        onClick={() => dispatch(openLoginModal())}
      >
        Login
      </button>
    )
  } else {
    return (
      <button
        className={`${styles.button} ${styles.initial}`}
        onClick={handleLogout}
      >
        Logout
      </button>
    )
  }
}
