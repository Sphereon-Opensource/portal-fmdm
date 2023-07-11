import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

const SURFModal = () => {
  const [rememberUsername, setRememberUsername] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // Perform login logic
  }

  const handleCheckboxChange = () => {
    setRememberUsername(!rememberUsername)
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  return (
    <div
      style={{ display: 'flex', gap: '1rem', padding: '0', height: '600px' }}
    >
      <div style={{ padding: '51px', width: '540px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h5
            style={{
              marginBottom: '82px',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}
          >
            Log in met je account
          </h5>
          <Form.Group>
            <Form.Control
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Gebruikersnaam"
              style={{
                borderRadius: '9px',
                marginBottom: '1.5rem',
                width: '100%'
              }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Wachtwoord"
              style={{
                borderRadius: '9px',
                marginBottom: '1.5rem',
                width: '100%'
              }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Gebruikersnaam onthouden"
              checked={rememberUsername}
              onChange={handleCheckboxChange}
              style={{ marginBottom: '0.5rem' }}
            />
          </Form.Group>
        </div>
        <Button
          variant="primary"
          onClick={handleLogin}
          style={{
            borderRadius: '9px',
            backgroundColor: '#48A4ED',
            color: '#FFFFFF',
            width: '100%'
          }}
        >
          Login
        </Button>
        <div className="mt-2 text-center">
          <a href="#">Ik ben mijn wachtwoord vergeten</a>
        </div>
      </div>
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
            style={{
              borderRadius: '9px',
              backgroundColor: '#48A4ED',
              width: '100%'
            }}
          >
            Met je instellingsaccount
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SURFModal
