import { createAgent } from '@veramo/core'
import {
  IQRCodeGenerator,
  QrCodeProvider
} from '@sphereon/ssi-sdk.qr-code-generator'
import {
  ISIOPv2OID4VPRPRestClient,
  SIOPv2OID4VPRPRestClient
} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client'

import { siopAgentBaseURL, siopPresentationDefID } from '../../../../app.config'
const agent = createAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient>({
  plugins: [
    new QrCodeProvider(),
    new SIOPv2OID4VPRPRestClient({
      baseUrl: siopAgentBaseURL,
      definitionId: siopPresentationDefID
    })
  ]
})
export default agent
