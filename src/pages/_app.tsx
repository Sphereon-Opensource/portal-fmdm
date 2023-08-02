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
  oidcAuthority,
  oidcClientName,
  oidcRedirectUri,
  oidcScope,
  oidcSilentRedirectUri
} from '../../app.config'
import store from '../store'
import { Provider } from 'react-redux'

const oidcConfig: OidcConfiguration = {
  client_id: oidcClientName ?? 'energySHRPortal',
  redirect_uri:
    oidcRedirectUri ?? 'http://localhost:8000/authentication/callback',
  silent_redirect_uri: oidcSilentRedirectUri ?? `https://localhost:8080/silent`,
  scope: oidcScope ?? 'openid profile email',
  authority: oidcAuthority ?? 'http://localhost:8888/auth/realms/conext',
  // service_worker_relative_url: '/OidcServiceWorker.js',
  service_worker_only: false
}

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })
  return (
    <MarketMetadataProvider>
      <Web3Provider>
        <UrqlProvider>
          <UserPreferencesProvider>
            <ConsentProvider>
              <SearchBarStatusProvider>
                <OidcProvider configuration={oidcConfig}>
                  <Provider store={store}>
                    <App>
                      <Component {...pageProps} />
                    </App>
                  </Provider>
                </OidcProvider>
              </SearchBarStatusProvider>
            </ConsentProvider>
          </UserPreferencesProvider>
        </UrqlProvider>
      </Web3Provider>
    </MarketMetadataProvider>
  )
}

export default MyApp
