import React from 'react'
import { Button } from 'react-bootstrap'
import { useOidc } from '@axa-fr/react-oidc'

const OidcTab: React.FC = () => {
  const { login } = useOidc()

  const handleLogin = async () => {
    await login()
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        gap: '1rem',
        padding: '0'
      }}
    >
      <div
        style={{
          flex: 1,
          backgroundColor: '#EBEBEB',
          padding: '51px',
          width: '540px'
        }}
      >
        <div className="text-center">
          <h5
            style={{
              marginBottom: '35px',
              fontSize: '1.2rem',
              color: '#000000',
              fontWeight: '600'
            }}
          >
            Of log in met...
          </h5>
          <Button
            variant="primary"
            onClick={handleLogin}
            style={{
              borderRadius: '9px',
              backgroundColor: '#48A4ED',
              width: '50%'
            }}
          >
            Met je instellingsaccount
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OidcTab
