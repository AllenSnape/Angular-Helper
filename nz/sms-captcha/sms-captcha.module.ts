import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsCaptchaComponent } from './sms-captcha.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    SmsCaptchaComponent,
  ],
  imports: [
    CommonModule,

    NgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    SmsCaptchaComponent,
  ],
})
export class SmsCaptchaModule { }
