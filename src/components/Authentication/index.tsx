import React, { useState } from 'react'
import { Modal, Nav } from 'react-bootstrap'
import SiopTab from './SIOP/SiopTab'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import OidcTab from './OIDC'
import {
  oidcModalTabName,
  isOIDCActivated,
  isSiopActivated
} from '../../../app.config'
import { useOidc } from '@axa-fr/react-oidc'

interface LoginModalProps {
  onCloseClicked?: () => void
  showModal: boolean
}

const LoginModal = ({ onCloseClicked, showModal }: LoginModalProps) => {
  const [payload, setPayload] = useState<AuthorizationResponsePayload>()
  const showOIDC = JSON.parse(isOIDCActivated)
  const showSIOP = JSON.parse(isSiopActivated)
  const initialTab = showOIDC ? 'oidc' : 'siop'
  const [activeTab, setActiveTab] = useState(initialTab)

  let isOidcAuthenticated
  if (JSON.parse(isOIDCActivated)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isAuthenticated: oidcAuthenticated } = useOidc()
    isOidcAuthenticated = oidcAuthenticated
  }
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleClose = () => {
    onCloseClicked?.()
  }

  return (
    <Modal show={showModal && !isOidcAuthenticated} onHide={handleClose}>
      <Modal.Header closeButton onClick={handleClose}>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '100%' }}>
        <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
          {showOIDC && (
            <Nav.Item>
              <Nav.Link eventKey="oidc">{oidcModalTabName}</Nav.Link>
            </Nav.Item>
          )}
          {showSIOP && (
            <Nav.Item>
              <Nav.Link eventKey="siop">SIOP</Nav.Link>
            </Nav.Item>
          )}
        </Nav>
        {activeTab === 'siop' && showSIOP && (
          <SiopTab onSignInComplete={setPayload} />
        )}
        {activeTab === 'oidc' && showOIDC && <OidcTab />}
      </Modal.Body>
    </Modal>
  )
}

export default LoginModal
