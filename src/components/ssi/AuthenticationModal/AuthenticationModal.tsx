import { Col, Container, Modal, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import AuthenticationQR from './AuthenticationQR'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'

/* This is a container dialog for the QR code component. It re emits the onSignInComplete callback.  */

export type AuthenticationModalProps = {
  show?: boolean
  onCloseClicked?: () => void
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
}

interface AuthenticationModalState {
  authRequestRetrieved: boolean
  isCopied: boolean
  qrCodeData: string
}

export default class AuthenticationModal extends Component<
  AuthenticationModalProps,
  AuthenticationModalState
> {
  constructor(props: AuthenticationModalProps) {
    super(props)
    this.state = {
      authRequestRetrieved: false,
      isCopied: false,
      qrCodeData: ''
    }
  }

  render() {
    return (
      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen="true"
        show={this.props.show}
        className="login-modal"
      >
        <div className="walletconnect-modal__header">
          <div className="walletconnect-modal__headerLogo" />

          <p className="login-modal-heading">Login</p>

          <div className="walletconnect-modal__close__wrapper">
            <div
              className="walletconnect-modal__close__icon"
              onClick={this.handleClose}
            >
              <div className="walletconnect-modal__close__line1"></div>
              <div className="walletconnect-modal__close__line2"></div>
            </div>
          </div>
        </div>
        <Modal.Body>
          <Container>
            <Row className="login-modal-row">
              <Col className="login-description-container">
                <p>For the first time access</p>

                <p className="login-step-heading">Step 1. Have a wallet</p>
                <p>Install a compliant SSI wallet</p>

                <p className="login-step-heading">
                  Step 2. Get the Guest credential
                </p>
                <p>
                  Request a Guest credential via this form and store it in your
                  wallet*
                </p>

                <p className="login-step-heading">Step 3. Scan the QR code</p>
                <p>
                  Scan the QR code on the right & share the credential form your
                  wallet
                </p>

                <p className="login-description-note">
                  *In the near future you will be able to choose to login with
                  other types of credentials
                </p>
              </Col>
              <Col className="login-qr-code-col">
                <AuthenticationQR
                  setQrCodeData={this.copyQRCode}
                  onAuthRequestRetrieved={() => {
                    this.setState({ ...this.state, authRequestRetrieved: true })
                  }}
                  onSignInComplete={this.props.onSignInComplete}
                  className="login-qr-code"
                />
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    )
  }

  private copyQRCode = (text: string): void => {
    this.setState({ ...this.state, qrCodeData: text })
  }

  private handleClose = () => {
    this.props.onCloseClicked?.()
  }
}
