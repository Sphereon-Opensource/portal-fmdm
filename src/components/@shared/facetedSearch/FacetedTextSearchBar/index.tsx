import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useRef
} from 'react'
import SearchIcon from '@images/search.svg'
import InputElement from '@shared/FormInput/InputElement'
import styles from './index.module.css'
import { addExistingParamsToUrl } from '../../../Search/utils'
import { useRouter } from 'next/router'
import { animated, useSpring } from 'react-spring'
import { useSearchBarStatus } from '@context/SearchBarStatus'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

async function emptySearch() {
  const searchParams = new URLSearchParams(window?.location.href)
  const text = searchParams.get('text')

  if (text !== ('' || undefined || null)) {
    await addExistingParamsToUrl(location, ['text', 'owner', 'tags'])
  }
}

export default function Index({
  placeholder,
  initialValue = '',
  isSearchPage,
  onValueChange,
  onSearch
}: {
  placeholder?: string
  initialValue?: string
  isSearchPage?: boolean
  onValueChange?: (value: string) => void
  onSearch: (text: string) => Promise<void>
}): ReactElement {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const parsed = router.query
  const isHome = window.location.pathname === '/'
  const searchBarRef = useRef<HTMLInputElement>(null)
  const {
    isSearchBarVisible,
    setSearchBarVisible,
    homeSearchBarFocus,
    setHomeSearchBarFocus
  } = useSearchBarStatus()
  useEffect(() => {
    if (parsed?.text || parsed?.owner)
      setValue((parsed?.text || parsed?.owner) as string)
  }, [parsed?.text, parsed?.owner])

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    setSearchBarVisible(false)
    setHomeSearchBarFocus(false)
  }, [setSearchBarVisible, setHomeSearchBarFocus])

  useEffect(() => {
    if (!isSearchBarVisible && !homeSearchBarFocus) return
    if (searchBarRef?.current) {
      searchBarRef.current.focus()
    }
  }, [isSearchBarVisible, homeSearchBarFocus])

  async function startSearch(e: FormEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault()
    if (value === '') {
      setValue(' ')
    }
    await onSearch(value)
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    setValue(e.target.value)
    if (onValueChange) {
      onValueChange(e.target.value)
    }
    e.target.value === '' && emptySearch()
  }

  async function handleKeyPress(
    e: KeyboardEvent<HTMLInputElement>
  ): Promise<void> {
    if (e.key === 'Enter') {
      await startSearch(e)
    }
  }

  async function handleButtonClick(
    e: FormEvent<HTMLButtonElement>
  ): Promise<void> {
    e.preventDefault()
    await startSearch(e)
  }

  const springStile = useSpring({
    transform:
      isHome || isSearchPage || isSearchBarVisible
        ? 'translateY(0%)'
        : 'translateY(-150%)',
    config: { mass: 1, tension: 140, friction: 12 }
  })

  return (
    <form
      className={cx({
        search: true,
        hiddenSearch: isHome && !homeSearchBarFocus
      })}
      autoComplete={!value ? 'off' : 'on'}
    >
      <animated.div style={springStile} className={styles.springContainer}>
        <InputElement
          ref={searchBarRef}
          type="search"
          name="search"
          placeholder={placeholder || 'Search...'}
          value={value}
          onChange={handleChange}
          required
          size="small"
          className={styles.input}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleButtonClick} className={styles.button}>
          <SearchIcon className={styles.searchIcon} />
        </button>
      </animated.div>
    </form>
  )
}
