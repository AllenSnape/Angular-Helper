import {Component, ElementRef, forwardRef, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {OssService} from '../../aliyun/oss.service';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ImageUploaderComponent),
    }
  ]
})
export class ImageUploaderComponent implements OnInit, ControlValueAccessor {

  // 默认图片
  readonly LOGO = 'https://angular.io/assets/images/logos/angular/angular.svg';

  // 是否必填
  @Input()
  required = false;

  // 是否设置为了只读
  @Input()
  readOnly = false;

  // 当前启用状态
  @Input()
  disabled = false;

  // OSS服务
  @Input()
  oss: OssService;

  // 图片名称
  @Input()
  label = '图片';

  // 保存的文件夹
  @Input()
  folder = 'images/';

  // 是否使用全链接而非文件key
  @Input()
  useURL = false;

  // 默认图片
  @Input()
  placeholder: string = null;

  // 图片高度
  @Input()
  height = 150;

  // input标签
  @ViewChild('fileUploader', { static: true })
  fileUploader: ElementRef<HTMLInputElement>;

  constructor(
    @Optional()
    private readonly ossFromInjector: OssService,
    private readonly msg: NzMessageService,
  ) {}

  ngOnInit() {
    this.oss = this.oss || this.ossFromInjector;
  }

  /**
   * 显示图片选择器
   */
  showFileSelector(): void {
    this.fileUploader.nativeElement.click();
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 在新标签中打开图片
   * @param url 图片链接
   */
  showImageInNewTab(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * 选择文件时
   * @param e 文件选择回调
   */
  onFileSelect(e?: Event | boolean): void {
    if (e instanceof Event) {
      if (this.oss) {
        this.oss.uploadInputChangeEvent(this.folder, e).subscribe(key => {
          this.value = this.oss.sign(key);
          this.onChange(this.useURL ? this.value : key);
        });
      } else {
        this.msg.info('文件系统未初始化!');
      }
    } else {
      this.value = null;
      if (this.onChange && e !== false) {
        this.onChange(this.value);
      }
    }
  }

  // region ControlValueAccessor必要内容

  // 签了名的链接
  value: string = null;

  // 值改变后需要调用的方法, 用来通知
  onChange: (_: any) => void = null;

  // 用来通知当前出现了改动
  onTouched: () => void = null;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // 上一次回填的内容
  lastWroteValue: string = null;

  writeValue(obj: any): void {
    if (obj) {
      // 查询过了的则忽略
      if (this.lastWroteValue === obj) return;
      this.lastWroteValue = this.value =  obj;
      if (this.oss) {
        this.value = this.oss.sign(obj);
      } else {
        this.msg.info('文件系统暂未初始化!');
      }
    } else {
      this.onFileSelect(false);
    }
  }

  // endregion

}
