import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LoadingIndicatorComponent } from './loading-indicator.component';

const COMPONENT = [LoadingIndicatorComponent];

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: COMPONENT,
  exports: COMPONENT
})
export class LoadingIndicatorModule {}
