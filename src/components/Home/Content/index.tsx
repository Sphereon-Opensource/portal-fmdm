import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Checkmark from '@images/checkmark.svg'
import HighlightBox from './HighlightBox'
import content from '../../../../content/pages/home/content.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'
import Button from '@shared/atoms/Button'

interface HomeContentData {
  teaser: {
    caption: string
    body: {
      title: string
      text: string
    }[]
  }
  points?: {
    list: {
      text: string
      subtext?: string
    }[]
    caption: string
  }
  getInvolved: {
    title: string
    text: string
    buttonLabel: string
    link: string
  }
  firstTimeVisiting: {
    title: string
    text: string
    buttonLabel: string
    link: string
  }
}

export default function HomeContent(): ReactElement {
  const { teaser, points, firstTimeVisiting, getInvolved }: HomeContentData =
    content

  return (
    <Container className={styles.wrapper}>
      <span className={styles.subtitleGrey}>{teaser.caption}</span>
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '90%'
          }}
        >
          {teaser.body.map((t, i) => {
            return (
              <div key={i} className={styles.teaser}>
                <h2>{t.title}</h2>
                <Markdown text={t.text} />
              </div>
            )
          })}
        </div>
        <div className={styles.secondarySection}>
          <div className={styles.points}>
            <span className={styles.subtitleGrey}>{points.caption}</span>
            {points.list.map((point, i) => (
              <span key={i}>
                <Checkmark className={styles.checkmark} />
                <Markdown
                  className={styles.pointText}
                  text={point.text}
                  subtext={point.subtext}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        className={styles.highlightBox}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'left',
          marginTop: 'calc(var(--spacer) * 2)',
          gap: 'calc(var(--spacer) * 3)'
        }}
      >
        <HighlightBox
          title={getInvolved.title}
          body={getInvolved.text}
          buttonLabel={getInvolved.buttonLabel}
          link={getInvolved.link}
          button={{ style: 'text', arrow: true }}
        />
        <HighlightBox
          title={firstTimeVisiting.title}
          body={firstTimeVisiting.text}
          buttonLabel={firstTimeVisiting.buttonLabel}
          link={firstTimeVisiting.link}
          button={{ style: 'text', arrow: true }}
        />
      </div>
    </Container>
  )
}
