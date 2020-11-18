export const environment = {
  production: true,
  version: "1.1.VERSION_WILL_BE_REPLACED_BY_CICD",
  auth: {
    cognitoAwsRegion: 'ap-southeast-2',
    cognitoUserPoolId: 'ap-southeast-2_B3Lx9B4bL',
    cognitoDomain: 'uoapool',
    cognitoClientId: 'ubfkgp8an0sm1dqc9q2mia76h',
    redirectUri: 'https://mediaplayer.auckland.ac.nz',
    logout_uri: 'https://mediaplayer.auckland.ac.nz',
    scopes: 'openid profile https://media.auckland.ac.nz/mediaplayer',
    codeChallengeMethod: 'S256',
  },
  privateUrlKeyWords: {
    whoNeedBearerToken: ['apigw.prod.amazon.auckland.ac.nz'],
  },
  mediaUri: 'https://mediacloud.auckland.ac.nz',
  mediaUriFallback: 'https://mediastore.auckland.ac.nz',
  signedCookieApiEndpoint: 'https://apigw.prod.amazon.auckland.ac.nz/media-cookies'
};