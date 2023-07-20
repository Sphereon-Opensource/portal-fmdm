import React, { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'

export default function FacetedSearchCheckBox({
  onValueChange,
  value
}: {
  onValueChange?: (isChecked: boolean) => Promise<void>
  value?: boolean
}): ReactElement {
  const [isChecked, setIsChecked] = useState(value)

  useEffect((): void => {
    setIsChecked(value)
  }, [value])

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: isChecked ? '#3E6CE2' : 'white',
        ...(!isChecked && { border: '1px solid #939393' })
      }}
      onClick={async (): Promise<void> => {
        setIsChecked(!isChecked)
        if (onValueChange) {
          await onValueChange(!isChecked)
        }
      }}
    >
      {isChecked && <img src={'./checkmark_icon.svg'} alt={'checkmark icon'} />}
    </div>
  )
}
