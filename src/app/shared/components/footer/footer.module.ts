import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { IonicModule } from '@ionic/angular';

const COMPONENT = [FooterComponent];

@NgModule({
  declarations: [COMPONENT],
  exports: [COMPONENT],
  imports: [CommonModule, IonicModule]
})
export class FooterModule {}
