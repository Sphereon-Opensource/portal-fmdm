import React, { useEffect } from 'react'
import { OidcUserStatus, useOidcUser } from '@axa-fr/react-oidc'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'
import { setAuthState } from '../../store/actions/authentication.actions'

const CallbackPage = () => {
  const { oidcUserLoadingState } = useOidcUser()
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    if (oidcUserLoadingState === OidcUserStatus.Loaded) {
      dispatch(setAuthState(AuthenticationStatus.OIDC))
      router.push('/search')
    }
  }, [oidcUserLoadingState, dispatch, router])

  switch (oidcUserLoadingState) {
    case OidcUserStatus.Loading:
      return <p>User Information are loading</p>
    case OidcUserStatus.Unauthenticated:
      return <p>you are not authenticated</p>
    case OidcUserStatus.LoadingError:
      return <p>Fail to load user information</p>
    default:
      return <div>Redirecting...</div>
  }
}

export default CallbackPage
