import React, { ReactElement } from 'react'
import LogoAsset from '@images/Energy_SHR_logo.svg'
import LogoAssetInverted from '@images/fmdm-logo-white.svg'
import styles from './index.module.css'

export default function Logo({
  inverted
}: {
  inverted?: boolean
}): ReactElement {
  return inverted ? (
    <LogoAssetInverted className={styles.logo} />
  ) : (
    <LogoAsset className={styles.logo} />
  )
}
