export const environment = {
  production: false,
  version: "1.1.VERSION_WILL_BE_REPLACED_BY_CICD",
  auth: {
    cognitoAwsRegion: 'ap-southeast-2',
    cognitoUserPoolId: 'ap-southeast-2_pgErjyL4O',
    cognitoDomain: 'uoapool-sandbox',
    cognitoClientId: '2a0cinp0j4c1mhbm9gfidpd9ne',
    redirectUri: 'https://localhost:8100',
    logout_uri: 'https://localhost:8100',
    scopes: 'openid profile https://media.auckland.ac.nz/mediaplayer',
    codeChallengeMethod: 'S256',
  },
  privateUrlKeyWords: {
    whoNeedBearerToken: ['apigw.sandbox.amazon.auckland.ac.nz']
  },
  mediaUri: 'https://mediacloud.dev.auckland.ac.nz',
  mediaUriFallback: 'https://mediastore.dev.auckland.ac.nz',
  signedCookieApiEndpoint: 'https://apigw.sandbox.amazon.auckland.ac.nz/media-player-cloud/cookies'
};