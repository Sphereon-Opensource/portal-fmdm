import React, { ReactElement } from 'react'
import styles from './index.module.css'

export default function FacetedSearchCollapseButton({
  onClick,
  isCollapsed
}: {
  onClick: () => Promise<void>
  isCollapsed: boolean
}): ReactElement {
  return (
    <div className={styles.container} onClick={onClick}>
      <img
        src={isCollapsed ? '/plus_icon.svg' : '/minus_icon.svg'}
        alt={'collapse/expand search type'}
      />
    </div>
  )
}
