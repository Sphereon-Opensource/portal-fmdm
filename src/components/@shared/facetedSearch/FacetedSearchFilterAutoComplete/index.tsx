import React, { ReactElement } from 'react'
import CreatableSelect from 'react-select/creatable'
import { MultiValue } from 'react-select'
import styles from './index.module.css'
import { InputProps } from '../../FormInput'
import { Keyword } from '@components/Search/utils'

export interface AutoCompleteOption {
  readonly value: string
  readonly label: string
}

export default function FacetedSearchFilterAutoComplete({
  ...props
}: Omit<InputProps, 'value'> & {
  value: MultiValue<AutoCompleteOption>
  onValueChange: (value: AutoCompleteOption[]) => Promise<void>
  tags: Array<Keyword>
}): ReactElement {
  const { placeholder, value, onValueChange, tags } = props

  return (
    <CreatableSelect
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
      className={styles.select}
      hideSelectedOptions
      isMulti
      isClearable={true}
      onChange={onValueChange}
      openMenuOnClick
      options={tags
        .map((tag: Keyword) => ({ label: tag.label, value: tag.label }))
        .slice()
        .sort((a: AutoCompleteOption, b: AutoCompleteOption) =>
          a.label.localeCompare(b.label)
        )}
      placeholder={placeholder}
      value={value}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
      noOptionsMessage={() => null}
      isValidNewOption={() => false}
    />
  )
}
