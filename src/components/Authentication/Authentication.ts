import { useState, useEffect } from 'react'
import { useOidc } from '@axa-fr/react-oidc'
import { useSIOP } from './SIOP/siopAuth'

export function useAuthentication() {
  const {
    login: oidcLogin,
    logout: oidcLogout,
    isAuthenticated: oidcAuthenticated
  } = useOidc()
  const {
    login: siopLogin,
    logout: siopLogout,
    isAuthenticated: siopAuthenticated
  } = useSIOP()

  const [isAuthenticated, setIsAuthenticated] = useState(
    oidcAuthenticated || siopAuthenticated
  )

  useEffect(() => {
    setIsAuthenticated(oidcAuthenticated || siopAuthenticated)
  }, [oidcAuthenticated, siopAuthenticated])

  const login = (method) => {
    if (method === 'oidc') {
      oidcLogin()
    } else if (method === 'siop') {
      siopLogin()
    }
  }

  const logout = (method) => {
    if (method === 'oidc') {
      oidcLogout()
    } else if (method === 'siop') {
      siopLogout()
    }
  }

  return { login, logout, isAuthenticated }
}
