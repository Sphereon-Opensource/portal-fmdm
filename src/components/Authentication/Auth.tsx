import React, { useState } from 'react'
import styles from './SIOP/Auth/Auth.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { AuthenticationStatus } from './authentication.types'
import { logout } from '../../store/actions/authentication.actions'
import { RootState } from '../../store'
import { useOidc } from '@axa-fr/react-oidc'
import { useSIOP } from '@components/Authentication/SIOP/siopAuth'
import LoginModal from '@components/Authentication/index'

export default function Auth() {
  const {
    login: oidcLogin,
    logout: oidcLogout,
    isAuthenticated: oidcAuthenticated
  } = useOidc()
  const {
    login: siopLogin,
    logout: siopLogout,
    isAuthenticated: siopAuthenticated
  } = useSIOP()
  const dispatch = useDispatch()
  const authenticationState = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = () => {
    switch (authenticationState) {
      case AuthenticationStatus.OIDC:
        oidcLogout()
        break
      case AuthenticationStatus.SIOP:
        siopLogout()
        break
    }
    dispatch(logout())
  }

  const handleLoginClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      {authenticationState === AuthenticationStatus.NOT_AUTHENTICATED ? (
        <>
          <button
            className={`${styles.button} ${styles.initial}`}
            onClick={handleLoginClick}
          >
            Login
          </button>
          {isModalOpen && <LoginModal onCloseClicked={handleModalClose} />}
        </>
      ) : (
        <button
          className={`${styles.button} ${styles.initial}`}
          onClick={handleLogout}
        >
          Logout
        </button>
      )}
    </>
  )
}
