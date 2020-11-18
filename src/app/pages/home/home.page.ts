import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as shaka from './shaka-player.ui.js';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '@uoa/auth';
import { environment } from '../../../environments/environment';

declare var ga;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss', 'material-icons.css', 'controls.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage implements OnInit {
  uri = environment.mediaUri; // cloud base URL
  fallbackUri = environment.mediaUriFallback; // on-premise base URL
  path;
  fileToLoad;
  player;
  browserSupported = true;  // Assume browser is supported until we find out otherwise
  clientIp;
  upi;
  manifestExists;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private loginService: LoginService
  ) {}

  async ngOnInit() {
    // Get signed cookies (should try/catch this)
    await this.getSignedCookies();

    // Get user info
    let user = await this.loginService.getUserInfo();
    this.upi = user.upi;
    
    // Set extension based on available support
    let support = await shaka.Player.probeSupport();
    let ext;
    if(support.manifest.mpd) {
      ext = '.mpd';
    } else {
      ext = '.m3u8';
    }

    // Get the path from the URL
    this.path = this.router.url;

    // Check if the path ends in .preview
    if(this.path.match(/\.preview$/) !== null) {
      // If yes, replace it with the extension
      this.fileToLoad = this.uri + this.path.replace('.preview', ext);
    } else {
      // If no, redirect to actual cloud media file
      window.open(this.uri + this.path, '_self');
    }

    // Do we have a manifest? Possible we don't...
    this.manifestExists = await this.checkFileExists(this.fileToLoad);
    if(!this.manifestExists) {
      // Current business logic is to redirect to on-premise (will be modified in due course)
      this.sendGaBeacon();
      this.redirectToOnPremise();
      return;
    }

    // Install ShakaPlayer polyfills
    shaka.polyfill.installAll();

    // Check to see if the browser supports the requisite APIs
    this.browserSupported = shaka.Player.isBrowserSupported();

    this.sendGaBeacon();

    // Shall we initialise the player or go home?
    if(this.browserSupported) {
      this.initPlayer();
    }
  }

  sendGaBeacon() {
    ga('send', {
      'hitType': 'pageview',
      'dimension1': 'aws',
      'dimension2': this.browserSupported.toString(),
      'dimension3': this.manifestExists.toString(),
      'dimension4': this.upi,
      'dimension5': this.clientIp
    });
  }

  async initPlayer() {
    const video = document.getElementById('video');
    const container = document.getElementById('video-container');
    this.player = new shaka.Player(video);
    const ui = new shaka.ui.Overlay(this.player, container, video)
 
    const config = {
      controlPanelElements: ["time_and_duration", "spacer", "volume", "fullscreen", "overflow_menu"],
      overflowMenuButtons: ["quality", "playback_rate", "picture_in_picture"],
      addBigPlayButton: true
    }
    ui.configure(config);

    // Send cookies
    this.player.getNetworkingEngine().registerRequestFilter(function(request_type, request) {
      request.allowCrossSiteCredentials = true;
    });

    // Try to load the file
    try {
      await this.player.load(this.fileToLoad);
      console.log('Video loaded.');
    } catch(e) {
      console.log('Error loading video');
      // Assume this content doesn't exist in cloud and redirect to on-premise
      this.redirectToOnPremise();
    }
  }

  onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    this.onError(event.detail);
  }

  onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
  }

  redirectToOnPremise() {
    window.open(this.fallbackUri + this.path, '_self');
  }

  // PRIVATE
  private async getSignedCookies() {
    let data = await this.httpClient.get(environment.signedCookieApiEndpoint,{ withCredentials: true, observe: 'response' }).toPromise();
    this.clientIp = data.headers.get('x-amzn-remapped-x-forwarded-for') || 'Unknown';
    return data;
  }

  private async checkFileExists(uri) {
    console.log('HEAD check on ' + uri);
    // A non-200 response will throw an error. If you don't catch an error, the file must exist.
    try {
      await this.httpClient.head(uri,{ withCredentials: true, observe: 'response' }).toPromise();
      return true;
    } catch(e) {
      return false;
    }
  }
}
