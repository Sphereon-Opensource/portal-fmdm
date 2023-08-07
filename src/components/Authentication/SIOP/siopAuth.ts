import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import agent from './agent'
import { GenerateAuthRequestURIResponse } from './auth-model'
import {
  CreateElementArgs,
  QRType,
  URIData,
  ValueResult
} from '@sphereon/ssi-sdk.qr-code-generator'
import Debug from 'debug'
import { RootState } from '../../../store'
import { setAuthState } from '../../../store/actions/authentication.actions'
import { AuthenticationStatus } from '@components/Authentication/authentication.types'

const debug = Debug('sphereon:portal:ssi:AuthenticationQR')

const createQRCodeElement = (
  authRequestURIResponse: GenerateAuthRequestURIResponse
): CreateElementArgs<QRType.URI, URIData> => {
  const qrProps: CreateElementArgs<QRType.URI, URIData> = {
    data: {
      type: QRType.URI,
      object: authRequestURIResponse.authRequestURI,
      id: authRequestURIResponse.correlationId
    },
    onGenerate: (result: ValueResult<QRType.URI, URIData>) => {
      debug(JSON.stringify(result))
    },
    renderingProps: {
      bgColor: 'white',
      fgColor: '#a6271c',
      level: 'L',
      size: 290,
      title: 'Sign in'
    }
  }
  return qrProps
}

export const useSIOP = () => {
  const dispatch = useDispatch()
  const authenticationState = useSelector(
    (state: RootState) => state.authentication.authenticationStatus
  )

  const [authRequestURIResponse, setAuthRequestURIResponse] =
    useState<GenerateAuthRequestURIResponse | null>(null)
  const [qrCode, setQRCode] = useState<JSX.Element | null>(null)

  const qrExpirationMs =
    parseInt(process.env.NEXT_PUBLIC_SSI_QR_CODE_EXPIRES_AFTER_SEC ?? '300') *
    750
  const definitionId = process.env.NEXT_PUBLIC_OID4VP_PRESENTATION_DEF_ID

  const generateNewQRCode = () => {
    agent
      .siopClientCreateAuthRequest()
      .then((authRequestURIResponse) => {
        setAuthRequestURIResponse(authRequestURIResponse)
        agent
          .qrURIElement(createQRCodeElement(authRequestURIResponse))
          .then((qrCode) => {
            setQRCode(qrCode)
          })
      })
      .catch(console.error)
  }

  useEffect(() => {
    generateNewQRCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async () => {
    // handle login here
  }

  const logout = () => {
    if (authenticationState !== AuthenticationStatus.NOT_AUTHENTICATED) {
      dispatch(setAuthState(AuthenticationStatus.NOT_AUTHENTICATED))
    }
  }

  const refreshQRCode = () => {
    if (qrExpirationMs > 0 && authRequestURIResponse) {
      generateNewQRCode()
    }
  }

  const pollAuthStatus = async () => {
    // fixme ksadjad, do we need this here?
  }

  return {
    login,
    logout,
    isAuthenticated:
      authenticationState !== AuthenticationStatus.NOT_AUTHENTICATED,
    qrCode,
    refreshQRCode,
    pollAuthStatus
  }
}
