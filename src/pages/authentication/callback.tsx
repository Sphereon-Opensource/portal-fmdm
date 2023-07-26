import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useOidc } from '@axa-fr/react-oidc'

const CallbackPage = () => {
  const router = useRouter()
  const { login } = useOidc()

  useEffect(() => {
    const handleLogin = async () => {
      try {
        await login()
        router.push('/')
      } catch (err) {
        console.error(err)
      }
    }

    handleLogin()
  }, [login, router])

  return <div>Loading...</div>
}

export default CallbackPage
