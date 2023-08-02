import React, { ReactElement } from 'react'
import Publish from '../../components/Publish'
import Page from '@shared/Page'
import content from '../../../content/publish/index.json'
import router from 'next/router'
import { useDispatch } from 'react-redux'
import { useOidc } from '@axa-fr/react-oidc'
import { setAuthState } from '../../store/actions/authentication.actions'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'

export default function PagePublish(): ReactElement {
  const dispatch = useDispatch()
  const { title, description } = content
  const { isAuthenticated: oidcAuthenticated } = useOidc()
  // fixme: for some reason when we get to this page, the redux store resets and therefore we lose our previous state. here I'm checking it from our OIDC library and we're logged in with that, updating the state again
  if (oidcAuthenticated) {
    dispatch(setAuthState(AuthenticationStatus.OIDC))
  }
  return (
    <Page
      title={title}
      description={description}
      uri={router.route}
      noPageHeader
    >
      <Publish content={content} />
    </Page>
  )
}
