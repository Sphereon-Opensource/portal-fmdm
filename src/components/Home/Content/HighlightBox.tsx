import React, { ReactElement } from 'react'
import styles from './HighlightBox.module.css'
import Eye from '@images/eye.svg'
import Catalogue from '@images/catalogueIcon.svg'
import Markdown from '@components/@shared/Markdown'
import Button, { ButtonProps } from '@components/@shared/atoms/Button'

const icons = {
  eye: <Eye />,
  catalogue: <Catalogue />
}

export default function HighlightBox({
  icon,
  title,
  body,
  buttonLabel,
  link,
  button
}: {
  icon?: keyof typeof icons
  title: string
  body: string
  buttonLabel: string
  link?: string
  button?: ButtonProps
}): ReactElement {
  return (
    <div className={styles.container}>
      <span className={styles.heading}>
        <span className={styles.icon}>{icons[icon]}</span>
        <h3>{title}</h3>
      </span>
      <Markdown text={body} />
      <Button
        style={button?.style ?? 'primary'}
        arrow={button?.arrow}
        to={link}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
