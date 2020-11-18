export const environment = {
    production: true,
    version: "1.1.VERSION_WILL_BE_REPLACED_BY_CICD",
    auth: {
      cognitoAwsRegion: 'ap-southeast-2',
      cognitoUserPoolId: 'ap-southeast-2_gtuqqgIIq',
      cognitoDomain: 'uoapool-nonprod',
      cognitoClientId: '5o7tv4gfql3n7beu96bvo5anuv',
      redirectUri: 'https://mediaplayer.test.auckland.ac.nz',
      logout_uri: 'https://mediaplayer.test.auckland.ac.nz',
      scopes: 'openid profile https://media.auckland.ac.nz/mediaplayer',
      codeChallengeMethod: 'S256',
    },
    privateUrlKeyWords: {
      whoNeedBearerToken: ['apigw.test.amazon.auckland.ac.nz'],
    },
    mediaUri: 'https://mediacloud.test.auckland.ac.nz',
    mediaUriFallback: 'https://mediastore.test.auckland.ac.nz',
    signedCookieApiEndpoint: 'https://apigw.test.amazon.auckland.ac.nz/media-cookies'
  };