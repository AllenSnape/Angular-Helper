import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {LoadingService} from '../../services/loading.service';
import {Observable} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-sms-captcha',
  templateUrl: './sms-captcha.component.html',
  styleUrls: ['./sms-captcha.component.less']
})
export class SmsCaptchaComponent implements OnInit {

  // region 样式控制

  // 宽
  @Input()
  public nzLg: number[] = [12, 12];

  // endregion

  // 只读态
  @Input()
  public readonly = false;

  /**
   * 获取验证码
   * @param number 手机号
   * @param validator 附加的验证内容: 发送验证码的验证码图片或者一个人机确认回调key
   * @return true: 发送成功
   */
  @Input()
  public getCaptcha: (number: string, validator?: string) => Observable<boolean>;

  // 手机号标签
  @Input()
  public numberLabel = '手机号';

  // 手机号占位符
  @Input()
  public numberPlaceholder = '手机号';

  // 验证码标签
  @Input()
  public captchaLabel = '验证码';

  // 验证码占位符
  @Input()
  public captchaPlaceholder = '验证码';

  // 对应的表单对象
  @Input()
  public form: FormGroup;

  // 手机号字段
  @Input()
  public numberField: string;

  // 验证码字段
  @Input()
  public captchaField: string;

  // 成功获取验证码时
  @Output()
  public captchaSent: EventEmitter<void>;

  constructor(
    private readonly msg: NzMessageService,
    public  readonly loading: LoadingService,
  ) { }

  ngOnInit() { }

  // 获取验证码按钮显示的文字
  public captchaText = '获取验证码';

  // 验证码计时器标识符
  public captchaIntervalFlag = -1;

  // 验证码倒计时
  public captchaCountdown = 0;

  /**
   * 发送验证码
   */
  public sendCaptcha(): void {
    clearInterval(this.captchaIntervalFlag);

    this.getCaptcha(this.form.get(this.numberField).value).subscribe(res => {
      if (res) {
        this.msg.success('验证码发送成功, 请注意查收!');

        // 通知成功
        if (this.captchaSent) this.captchaSent.emit();

        // 开始倒计时
        this.captchaCountdown = 60;
        this.captchaText = this.captchaCountdown + '秒';
        this.captchaIntervalFlag = setInterval(() => {
          if (--this.captchaCountdown === 0) {
            this.captchaText = '获取验证码';
            clearInterval(this.captchaIntervalFlag);
          } else {
            this.captchaText = this.captchaCountdown + '秒';
          }
        }, 1000);
      }
    });
  }

}
