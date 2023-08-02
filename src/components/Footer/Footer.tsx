import Button from '@components/@shared/atoms/Button'
import Container from '@components/@shared/atoms/Container'
import Logo from '@components/@shared/atoms/Logo'
import Markdown from '@components/@shared/Markdown'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import React, { ReactElement } from 'react'
import styles from './Footer.module.css'

export default function Footer(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const { copyright, footer } = siteContent
  const { setShowPPC } = useUserPreferences()

  const cookies = useGdprMetadata()

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div
        style={{ border: '1px solid var(--sphereon-black)', width: '57%' }}
      ></div>
      <Container className={styles.container}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={styles.content}>
          <div className={styles.partners}>
            <p className={styles.partnerText}>{footer.partners}</p>
            <div className={styles.partnerImageContainer}>
              <div>
                <img
                  src="/images/partners/1-TU-Delft_logo.png"
                  alt="TU Delft"
                />
              </div>
              <div>
                <img
                  src="/images/partners/2-erasmus_uni_logo.png"
                  alt="Erasmus University"
                />
              </div>
            </div>
          </div>
          <div className={styles.links}>
            {footer.links.map((e) => (
              <Button
                key={e.label}
                style="text"
                className={styles.link}
                to={e.link}
              >
                {e.label}
              </Button>
            ))}
          </div>
          <div className={styles.copyrightContainer}>
            <div className={styles.copyright}>
              <span>
                <Markdown text={footer.designedBy} />
              </span>
              <span>
                <Markdown text={`&copy; ${year} ${copyright}`} />
              </span>
            </div>
            <div className={styles.legal}>
              <Button
                className={styles.linkButton}
                style="text"
                href="https://v4.portal.minimal-gaia-x.eu/imprint"
              >
                Imprint
              </Button>
              {' — '}
              <Button
                className={styles.linkButton}
                style="text"
                href="https://www.minimal-gaia-x.eu/privacy/en"
              >
                Privacy
              </Button>
              {appConfig.privacyPreferenceCenter === 'true' && (
                <>
                  {' — '}
                  <Button
                    style="text"
                    size="small"
                    className="link"
                    onClick={() => {
                      setShowPPC(true)
                    }}
                  >
                    {cookies.optionalCookies?.length > 0
                      ? 'Cookie Settings'
                      : 'Cookies'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
