import React, { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import Web3Provider from '@context/Web3'
import { UserPreferencesProvider } from '@context/UserPreferences'
import UrqlProvider from '@context/UrqlProvider'
import ConsentProvider from '@context/CookieConsent'
import MarketMetadataProvider from '@context/MarketMetadata'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import App from '../../src/components/App'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import '../stylesGlobal/styles.css'
import Decimal from 'decimal.js'

import { OidcConfiguration, OidcProvider } from '@axa-fr/react-oidc'
import {
  isOIDCActivated,
  oidcAuthority,
  oidcClientId,
  oidcRedirectUri,
  oidcScope
} from '../../app.config'
import store from '../store'
import { Provider, useDispatch } from 'react-redux'
import { NextComponentType, NextPageContext } from 'next'
import { setAuthState } from '../store/actions/authentication.actions'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'

type AppContentProps = {
  Component: NextComponentType<NextPageContext, any, any>
  pageProps: any
}

const oidcConfig: OidcConfiguration = {
  client_id: oidcClientId ?? 'energySHRPortal',
  redirect_uri:
    oidcRedirectUri ?? 'http://localhost:8000/authentication/callback',
  scope: oidcScope ?? 'openid profile email',
  authority: oidcAuthority ?? 'http://localhost:8888/auth/realms/conext',
  // service_worker_relative_url: '/OidcServiceWorker.js',
  service_worker_only: false
}

function wrapAuthProviders({
  Component,
  pageProps,
  onSessionLostHandler
}: AppContentProps & { onSessionLostHandler: () => void }): ReactElement {
  if (JSON.parse(isOIDCActivated)) {
    return (
      <OidcProvider
        configuration={oidcConfig}
        onSessionLost={onSessionLostHandler}
      >
        <Provider store={store}>
          <App>
            <Component {...pageProps} />
          </App>
        </Provider>
      </OidcProvider>
    )
  }

  return (
    <Provider store={store}>
      <App>
        <Component {...pageProps} />
      </App>
    </Provider>
  )
}

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })

  const MyAppWithDispatch = () => {
    const dispatch = useDispatch()

    const handleSessionLost = () => {
      dispatch(setAuthState(AuthenticationStatus.NOT_AUTHENTICATED))
    }

    return (
      <MarketMetadataProvider>
        <Web3Provider>
          <UrqlProvider>
            <UserPreferencesProvider>
              <ConsentProvider>
                <SearchBarStatusProvider>
                  {wrapAuthProviders({
                    Component,
                    pageProps,
                    onSessionLostHandler: handleSessionLost
                  })}
                </SearchBarStatusProvider>
              </ConsentProvider>
            </UserPreferencesProvider>
          </UrqlProvider>
        </Web3Provider>
      </MarketMetadataProvider>
    )
  }

  return (
    <Provider store={store}>
      <MyAppWithDispatch />
    </Provider>
  )
}

export default MyApp
