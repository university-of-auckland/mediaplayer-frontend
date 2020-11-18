# Media Player (Cloud)
This is a single page web app (SPA) which serves private video content. Currently, its specific purpose it to deliver lecture theatre recordings, but this could be extended over time.

## Quick Start
```javascript
npm install -g ionic
npm install
ionic serve --ssl
```
Visit [https://localhost:8100/2020/1200/DANCE101GL01C/1397054/8e5383/202001141000.LT358629.preview](https://localhost:8100/2020/1200/DANCE101GL01C/1397054/8e5383/202001141000.LT358629.preview) and tell your browser to ignore the SSL warnings.

## Infrastructure
Videos are transcoded into various formats and stored in Amazon S3, and served via CloudFront. CloudFront protects these assets with signed cookies.

At present, some videos are stored on-premise, and served from a different web app called MediaStore.

## How does it work?
The entire app is behind Single Sign-On (SSO), enabled via the UOA Auth Library.

Once authenticated, the app makes an HTTP request for a signed cookie.

The local configuration, found in `environment.ts`, fetches cookies from the "Sandbox" endpoint: https://apigw.sandbox.amazon.auckland.ac.nz/media-player-cloud/cookies

The Sandbox endpoint is configured to accept cross-domain requests from `https://localhost:8100` via the Access-Control-Allow-Origin header. It is important to note that when sending cookies in cross-domain request, the Access-Control-Allow-Origin header _cannot_ be wildcard. It must be explicitly set, hence you must be running this app on `https://localhost:8100`.

The app then determines the appropriate filepath of the video (based on the URL) and makes an HTTP HEAD request to see if the file exists in AWS. If it does, we go ahead and load it into the player. If it doesn't, we redirect to the on-premise web app.

## Shaka Player
[Shaka Player](https://github.com/google/shaka-player) is used for playing videos from manifest files (.mpd or .m3u8 depending on the device).

The library is *not* managed by npm. It is built from source, due to some minor modifications required.

## Some notes on cookies
Getting the cookie-based authentication to work, particularly on localhost, has been a hard-fought battle.

- Cross-domain cookies have to include the `Secure` attribute, which means they must be sent over HTTPS. You *must* run your app with the `--ssl` flag.
- The API endpoint which sets the cookies must have CORS enabled, since we're making the request from localhost. The Access-Control-Allow-Origin header cannot use `*` when transmitting cookies, so the dev version of the API is explicitly setup to serve localhost.
- Cookies aren't typically sent in XHR requests, so you have to explicitly set `withCredentials: true`
- This is true for Shaka Player too. You have to intercept the network request like so: `this.player.getNetworkingEngine().registerRequestFilter(function(request_type, request) { request.allowCrossSiteCredentials = true;});`
- The origin S3 bucket needs to have CORS enabled too; again, for localhost

This all means that the Sandbox/Dev AWS infrastructure is configured to support development on localhost, and will not work for a dev environment like https://mediaplayer.dev.auckland.ac.nz

Therefore, the environments are:

1. SPA in local dev; APIs in AWS Sandbox
2. SPA in AWS Non-Prod; APIs in AWS Non-Prod
3. SPA in AWS Prod; APIs in AWS Prod