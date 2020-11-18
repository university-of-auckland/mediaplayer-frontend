import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

const COMPONENT = [HeaderComponent];

@NgModule({
  declarations: [COMPONENT],
  exports: [COMPONENT],
  imports: [IonicModule, CommonModule]
})
export class HeaderModule {}
