import React, { useState, useEffect } from 'react'
import { Modal, Nav } from 'react-bootstrap'
import SSIAuthModal from './SIOP/SSIAuthModal'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import OIDCModal from './OIDC'
import {
  oidcModalTabName,
  isOIDCActivated,
  isSiopActivated
} from '../../../app.config'
import { useSelector, useDispatch } from 'react-redux'
import { closeLoginModal } from '../../store/actions/authentication.actions'
import { RootState } from '../../store'

const LoginModal = () => {
  const dispatch = useDispatch()
  let show = useSelector(
    (state: RootState) => state.authentication.loginModalOpen
  )
  const [payload, setPayload] = useState<AuthorizationResponsePayload>()
  // here both our login ways are disabled. so we can't login. we need to somehow add the metamask to this mix. this needs some input from @nklomp
  const showOIDC = JSON.parse(isOIDCActivated)
  const showSIOP = JSON.parse(isSiopActivated)

  if (!showOIDC && !showSIOP) {
    console.log(`in the if for closing the modal..`)
    show = false
    dispatch(closeLoginModal())
    console.log(`modal should be closed at this point`)
  }
  const initialTab = showOIDC ? 'oidc' : 'siop'
  const [activeTab, setActiveTab] = useState(initialTab)

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
          <SSIAuthModal onSignInComplete={setPayload} />
        )}
        {activeTab === 'oidc' && showOIDC && <OIDCModal />}
      </Modal.Body>
    </Modal>
  )
}

export default LoginModal
