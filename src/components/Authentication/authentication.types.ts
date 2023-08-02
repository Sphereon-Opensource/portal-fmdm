export enum AuthenticationStatus {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  SIOP = 'SIOP',
  OIDC = 'OIDC',
  WEB3_WALLET = 'WEB3_WALLET'
}

export interface AuthenticationState {
  authenticationStatus: AuthenticationStatus
}
