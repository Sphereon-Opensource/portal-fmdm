import React, { ReactElement, useEffect, useState } from 'react'
import Page from '@shared/Page'
import ProfilePage from '../../components/Profile'
import { accountTruncate } from '@utils/web3'
import { useWeb3 } from '@context/Web3'
import ProfileProvider from '@context/Profile'
import { useRouter } from 'next/router'
import web3 from 'web3'
import { useSelector } from 'react-redux'
import { useOidcUser } from '@axa-fr/react-oidc'
import { RootState } from '../../store'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'

export default function PageProfile(): ReactElement {
  const router = useRouter()
  const { accountId } = useWeb3()
  const { oidcUser } = useOidcUser()
  const authenticationStatus = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )

  const [finalAccountId, setFinalAccountId] = useState<string>()
  const [ownAccount, setOwnAccount] = useState(false)

  useEffect(() => {
    async function init() {
      if (!router?.asPath) return

      // Path is root /profile, have web3 take over
      if (
        router.asPath === '/profile' &&
        authenticationStatus !== AuthenticationStatus.OIDC
      ) {
        setFinalAccountId(accountId)
        setOwnAccount(true)
        return
      }

      const pathAccount = router.query.account as string

      // Path has ETH address
      if (web3.utils.isAddress(pathAccount)) {
        setOwnAccount(pathAccount === accountId)
        const finalAccountId = pathAccount || accountId
        setFinalAccountId(finalAccountId)
      }

      // Path has OIDC user information
      if (authenticationStatus === AuthenticationStatus.OIDC && oidcUser) {
        // Set the finalAccountId to the oidcUser username
        setFinalAccountId(oidcUser.preferred_username)
        setOwnAccount(true)
      }
    }
    init()
  }, [router, accountId, authenticationStatus, oidcUser])

  return (
    <Page
      uri={router.route}
      title={accountTruncate(finalAccountId)}
      noPageHeader
    >
      <ProfileProvider accountId={finalAccountId} ownAccount={ownAccount}>
        <ProfilePage accountId={finalAccountId} />
      </ProfileProvider>
    </Page>
  )
}
