import React from 'react'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import Button from '@shared/atoms/Button'

export default function Auth({
  setShow,
  payload,
  setPayload,
  className
}: {
  setShow: () => void
  payload: AuthorizationResponsePayload
  setPayload: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload>>
  className?: string
}) {
  if (!payload) {
    return (
      <Button style="text" className={className} onClick={setShow}>
        Login
      </Button>
    )
  } else {
    return (
      <Button
        style="text"
        className={className}
        onClick={() => setPayload(undefined)}
      >
        Logout
      </Button>
    )
  }
}
