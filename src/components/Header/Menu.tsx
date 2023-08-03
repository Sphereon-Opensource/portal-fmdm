import React, { ReactElement } from 'react'
import Link from 'next/link'
import Logo from '@shared/atoms/Logo'
import Networks from './UserPreferences/Networks'
import styles from './Menu.module.css'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import classNames from 'classnames/bind'
import MenuDropdown from '@components/@shared/MenuDropdown'
import Button from '@components/@shared/atoms/Button'
import Container from '@components/@shared/atoms/Container'
import Auth from '@components/Authentication/Auth'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
  subItems?: MenuItem[]
  className?: string
}

export function MenuLink({ name, link, className }: MenuItem) {
  const router = useRouter()

  const basePath = router?.pathname.split(/[/?]/)[1]
  const baseLink = link.split(/[/?]/)[1]

  const classes = cx({
    link: true,
    active: link.startsWith('/') && basePath === baseLink,
    [className]: className
  })

  return (
    <Button
      className={classes}
      {...(link.startsWith('/') ? { to: link } : { href: link })}
    >
      {name}
    </Button>
  )
}

export default function Menu(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const authenticationStatus = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )

  return (
    <Container>
      <nav className={styles.menu}>
        <Link href="/" className={styles.logo}>
          <Logo
            style={{
              width: '20rem',
              height: '5rem'
            }}
          />
        </Link>

        <ul className={styles.navigation}>
          {siteContent?.menu.map((item: MenuItem) => {
            if (
              item.name === 'Publish' &&
              authenticationStatus !== AuthenticationStatus.OIDC &&
              authenticationStatus !== AuthenticationStatus.SIOP
            ) {
              return null
            }

            return (
              <li key={item.name}>
                {item?.subItems ? (
                  <MenuDropdown label={item.name} items={item.subItems} />
                ) : (
                  <MenuLink {...item} />
                )}
              </li>
            )
          })}
          <li>
            <Auth className={styles.link} />
          </li>
        </ul>

        <div className={styles.actions}>
          {appConfig.chainIdsSupported.length > 1 && <Networks />}
        </div>
      </nav>
    </Container>
  )
}
