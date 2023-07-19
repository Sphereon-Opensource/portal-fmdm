import React, { useState } from 'react'
import { Modal, Nav } from 'react-bootstrap'
import AuthenticationModal from '../ssi/AuthenticationModal/AuthenticationModal'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import SURFModal from '@components/OIDC/AuthenticationModal'

const LoginModal = ({ show, setShow }) => {
  const [payload, setPayload] = useState<AuthorizationResponsePayload>()
  function onSignInComplete(payload: AuthorizationResponsePayload): void {
    setShow(false)
    setPayload(payload)
  }
  const [activeTab, setActiveTab] = useState('surf')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '100%' }}>
        <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
          <Nav.Item>
            <Nav.Link eventKey="surf">SURF</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="ssi">SSI</Nav.Link>
          </Nav.Item>
        </Nav>
        {activeTab === 'ssi' && (
          <AuthenticationModal onSignInComplete={onSignInComplete} />
        )}
        {activeTab === 'surf' && <SURFModal />}
      </Modal.Body>
    </Modal>
  )
}

export default LoginModal
