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
    title: string
    text: string
  }
  points: {
    text: string
  }[]
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
      <h2>{teaser.title}</h2>
      <div className={styles.container}>
        <div className={styles.teaser}>
          <Markdown text={teaser.text} />
        </div>
        <div className={styles.secondarySection}>
          <div className={styles.points}>
            {points.map((point, i) => (
              <span key={i}>
                <Checkmark className={styles.checkmark} />
                <Markdown className={styles.pointText} text={point.text} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <Button className={styles.learnMore} style="text" arrow to="#">
        Learn more
      </Button>
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
          button={{ style: 'text', arrow: true, to: firstTimeVisiting.link }}
        />
        <HighlightBox
          title={firstTimeVisiting.title}
          body={firstTimeVisiting.text}
          buttonLabel={firstTimeVisiting.buttonLabel}
          button={{ style: 'text', arrow: true, to: firstTimeVisiting.link }}
        />
      </div>
    </Container>
  )
}
