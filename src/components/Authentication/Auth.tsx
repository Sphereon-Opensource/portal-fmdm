import React, { useState } from 'react'
import styles from './SIOP/Auth/Auth.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { AuthenticationStatus } from './authentication.types'
import { logout } from '../../store/actions/authentication.actions'
import { RootState } from '../../store'
import { useOidc } from '@axa-fr/react-oidc'
import { useSIOP } from '@components/Authentication/SIOP/siopAuth'
import LoginModal from '@components/Authentication/index'
import { isOIDCActivated } from '../../../app.config'
export default function Auth() {
  let oidcLogoutFunc
  if (JSON.parse(isOIDCActivated)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { logout: oidcLogout } = useOidc()
    oidcLogoutFunc = oidcLogout
  }
  const { logout: siopLogout } = useSIOP()
  const dispatch = useDispatch()
  const authenticationState = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = () => {
    switch (authenticationState) {
      case AuthenticationStatus.OIDC:
        oidcLogoutFunc()
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
