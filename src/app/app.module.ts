import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AuthModule, CognitoConfigService } from '@uoa/auth';
import { ErrorPagesModule } from '@uoa/error-pages';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppAuthConfigService } from './core/services';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AuthModule, ErrorPagesModule, IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: CognitoConfigService, useClass: AppAuthConfigService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
