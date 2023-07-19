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

import { OidcProvider } from '@axa-fr/react-oidc'

const configuration = {
  client_id: process.env.OIDC_CLIENT_ID || 'client_id',
  redirect_uri: process.env.OIDC_REDIRECT_URI || `callback_url`,
  silent_redirect_uri:
    process.env.OIDC_SILENT_REDIRECT_URI || `silent_callback_url`,
  scope: process.env.OIDC_SCOPE || 'openid profile email',
  authority:
    process.env.OIDC_AUTHORITY || 'http://localhost:8888/auth/realms/conext',
  service_worker_relative_url: '/OidcServiceWorker.js',
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
                <OidcProvider configuration={configuration}>
                  <App>
                    <Component {...pageProps} />
                  </App>
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
