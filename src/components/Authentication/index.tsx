import React, { useState, useEffect } from 'react'
import { Modal, Nav } from 'react-bootstrap'
import SSIAuthModal from './SIOP/SSIAuthModal'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import OIDCModal from './OIDC'
import { oidcModalTabName } from '../../../app.config'
import { useSelector, useDispatch } from 'react-redux'
import { closeLoginModal } from '../../store/actions/authentication.actions'
import { RootState } from '../../store'

const LoginModal = () => {
  const dispatch = useDispatch()
  const show = useSelector(
    (state: RootState) => state.authentication.loginModalOpen
  )
  const [payload, setPayload] = useState<AuthorizationResponsePayload>()
  const [activeTab, setActiveTab] = useState('oidc')

  useEffect(() => {
    if (payload) {
      dispatch(closeLoginModal())
    }
  }, [payload, dispatch])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <Modal show={show} onHide={() => dispatch(closeLoginModal())}>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '100%' }}>
        <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
          <Nav.Item>
            <Nav.Link eventKey="oidc">{oidcModalTabName}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="siop">SSI</Nav.Link>
          </Nav.Item>
        </Nav>
        {activeTab === 'siop' && <SSIAuthModal onSignInComplete={setPayload} />}
        {activeTab === 'oidc' && <OIDCModal />}
      </Modal.Body>
    </Modal>
  )
}

export default LoginModal
