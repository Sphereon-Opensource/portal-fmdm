import React, { Component } from 'react'
import { Col, Row } from 'react-bootstrap'
import AuthenticationQR from './AuthenticationQR'
import {
  siopDownloadSSIWalletLink,
  siopIssueFromLink
} from '../../../../app.config'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'

interface SSIAuthModalProps {
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
}

interface SSIAuthModalState {
  authRequestRetrieved: boolean
  isCopied: boolean
  qrCodeData: string
}

export default class SiopTab extends Component<
  SSIAuthModalProps,
  SSIAuthModalState
> {
  private readonly scanText = 'Please scan the QR code with your app.'
  private readonly authText = 'Please approve the request in your app.'

  constructor(props: SSIAuthModalProps) {
    super(props)
    this.state = {
      authRequestRetrieved: false,
      isCopied: false,
      qrCodeData: ''
    }
  }

  render() {
    return (
      <div style={{ height: '600px' }}>
        <Row>
          <Col
            className="left-column"
            style={{ width: '540px', backgroundColor: '#EBEBEB' }}
          >
            <h5 style={{ marginTop: 60, marginBottom: 25, color: '#303030' }}>
              For the first time access
            </h5>
            <h5
              style={{ marginBottom: 6, fontWeight: 'bold', color: '#303030' }}
            >
              Step 1. Have a wallet
            </h5>
            <h6 style={{ marginBottom: 25, fontSize: 12, color: '#303030' }}>
              Install a compliant{' '}
              <a
                href={siopDownloadSSIWalletLink}
                rel="noreferrer"
                target="_blank"
                className={'modal-link'}
              >
                SSI wallet
              </a>
            </h6>
            <h5
              style={{ marginBottom: 6, fontWeight: 'bold', color: '#303030' }}
            >
              Step 2. Get the Guest credential
            </h5>
            <h6 style={{ marginBottom: 25, color: '#303030', fontSize: 12 }}>
              Request a Guest credential via{' '}
              <a
                href={siopIssueFromLink}
                rel="noreferrer"
                target="_blank"
                className={'modal-link'}
              >
                this form
              </a>{' '}
              and store it in your wallet*
            </h6>
            <h5
              style={{ marginBottom: 6, fontWeight: 'bold', color: '#303030' }}
            >
              Step 3. Scan the QR code
            </h5>
            <h6 style={{ marginBottom: 260, color: '#303030', fontSize: 12 }}>
              Scan the QR code on the right & share the credential form your
              wallet
            </h6>
            <h6 style={{ color: '#303030', fontSize: 12, maxWidth: 407 }}>
              *In the near future you will be able to choose to login with other
              types of credentials
            </h6>
          </Col>
          <Col
            style={{ width: '540px' }}
            className="d-flex justify-content-center align-items-center"
          >
            <div style={{ padding: 10, border: '4px solid #a6271c' }}>
              <AuthenticationQR
                setQrCodeData={this.copyQRCode}
                onAuthRequestRetrieved={() => {
                  this.setState({
                    ...this.state,
                    authRequestRetrieved: true
                  })
                }}
              />
            </div>
          </Col>
        </Row>
      </div>
    )
  }

  private copyQRCode = (text: string): void => {
    this.setState({ ...this.state, qrCodeData: text })
  }
}
