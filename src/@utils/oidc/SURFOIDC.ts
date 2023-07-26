import axios from 'axios'

export class SURFOIDC {
  private clientId: string
  private redirectUri: string
  private scope: string

  constructor(clientId: string, redirectUri: string, scope: string) {
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.scope = scope
  }

  initiateAuthentication() {
    // ksadjad handling initiation authentication using SURFOIDC
  }

  async handleAuthenticationCallback() {
    // ksadjad handling authentication callback using SURFOIDC here
  }

  handleTokens(accessToken: string, idToken: string) {
    // ksadjad todo handleTokens here
    // ...
  }

  async loginWithUsernameAndPassword(username: string, password: string) {
    const tokenEndpoint = 'https://openid-provider.com/token'
    const params = {
      grant_type: 'password',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      username,
      password
    }

    try {
      const response = await axios.post(tokenEndpoint, params)
      // eslint-disable-next-line camelcase
      const { access_token, id_token } = response.data

      // Validate and process the access_token and id_token as needed
      this.handleTokens(access_token, id_token)

      // Redirect to a success page or refresh the current page
      window.location.href = '/success'
    } catch (error) {
      // Handle authentication error
      console.error('Authentication failed:', error)
      // Redirect to an error page or display an error message
      window.location.href = '/error'
    }
  }
}
