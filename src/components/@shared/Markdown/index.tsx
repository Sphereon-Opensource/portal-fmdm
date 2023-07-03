import { markdownToHtml } from '@utils/markdown'
import React, { ReactElement } from 'react'
import styles from './index.module.css'

const Markdown = ({
  text,
  subtext,
  blockImages,
  className
}: {
  text: string
  subtext?: string
  blockImages?: boolean
  className?: string
}): ReactElement => {
  const content = !blockImages
    ? markdownToHtml(text)
    : markdownToHtml(text).replaceAll(
        /<img[\w\W]+?\/?>/g,
        `<img src="/images/image_blocked_placeholder.png" alt="Blocked image placeholder" class="${styles.blockedContentImage}" />`
      )
  const subContent = subtext ? markdownToHtml(subtext) : null
  const mergedClassName = `${styles.markdown} ${className || ''}`
  return (
    <div className={mergedClassName}>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        /*
            style={{
              ...(className !== 'firstTime' && { color: 'black' }),
              ...(className === 'firstTime' && { color: 'white' }),
              ...{ fontSize: 'var(--font-size-base)', fontWeight: 'var(-font-weight-base)' }
            }}
    */
      />
      {subContent && (
        <div
          style={{ fontWeight: 'var(--font-weight-base)' }}
          className={styles.subtext} // add a class for subtext styling
          dangerouslySetInnerHTML={{ __html: subContent }}
        />
      )}
    </div>
  )
}

export default Markdown
