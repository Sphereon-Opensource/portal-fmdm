import { oidcAuthority } from '../app.config'
// Add bellow trusted domains, access tokens will automatically injected to be send to
// trusted domain can also be a path like https://www.myapi.com/users,
// then all subroute like https://www.myapi.com/useers/1 will be authorized to send access_token to.

// Domains used by OIDC server must be also declared here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const trustedDomains = {
  default: [oidcAuthority]
}

// Service worker will continue to give access token to the JavaScript client
// Ideal to hide refresh token from client JavaScript, but to retrieve access_token for some
// scenarios which require it. For example, to send it via websocket connection.
trustedDomains.config_show_access_token = {
  domains: ['http://localhost:8080', oidcAuthority],
  showAccessToken: true
}
