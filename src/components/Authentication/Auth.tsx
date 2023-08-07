import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AuthenticationStatus } from './authentication.types'
import { logout } from '../../store/actions/authentication.actions'
import { RootState } from '../../store'
import { useOidc } from '@axa-fr/react-oidc'
import { useSIOP } from '@components/Authentication/SIOP/siopAuth'
import LoginModal from '@components/Authentication/index'
import { isOIDCActivated } from '../../../app.config'
import Button from '@shared/atoms/Button'

export default function Auth({ className }: { className?: string }) {
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

  const handleLoginClick = () => setIsModalOpen(true)
  const handleModalClose = () => setIsModalOpen(false)

  return (
    <>
      {authenticationState === AuthenticationStatus.NOT_AUTHENTICATED ? (
        <>
          <Button style="text" className={className} onClick={handleLoginClick}>
            Login
          </Button>
          {isModalOpen && (
            <LoginModal showModal={true} onCloseClicked={handleModalClose} />
          )}
        </>
      ) : (
        <Button style="text" className={className} onClick={handleLogout}>
          Logout
        </Button>
      )}
    </>
  )
}
