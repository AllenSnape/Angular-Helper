import {NgModule} from '@angular/core';
import {ImageUploaderComponent} from './image-uploader.component';
import {CommonModule} from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    ImageUploaderComponent,
  ],
  imports: [
    CommonModule,

    NgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    ImageUploaderComponent,
  ],
})
export class ImageUploaderModule { }
