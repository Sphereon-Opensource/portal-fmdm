import React, { ReactElement } from 'react'
import styles from './index.module.css'
import content from '../../../content/pages/aboutDemo.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'

interface AboutContent {
  header: {
    title: string
    body: string
  }
  main: {
    title: string
    body: string
  }
  footer: {
    title: string
    body: string
  }
  image: string
}

export default function AboutPage(): ReactElement {
  const { header, main, footer, image }: AboutContent = content

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4.5rem' }}>
      <div className={styles.wrapper}>
        <Container className={styles.mainContainer}>
          <div className={styles.main}>
            <div className={styles.content}>
              <h2 className={styles.title}>{header.title}</h2>
              <Markdown className={styles.body} text={header.body} />
            </div>
          </div>
        </Container>
        <div className={styles.objectives}>
          <h2>{main.title}</h2>
          <Markdown text={main.body} />
        </div>
        <Container className={styles.contactsContainer}>
          <h2 className={styles.title}>{footer.title}</h2>
          <Markdown className={styles.body} text={footer.body} />
        </Container>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <img src={image} className={styles.image} />
      </div>
    </div>
  )
}
