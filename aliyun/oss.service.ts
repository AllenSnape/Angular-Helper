import {Injectable} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';

import * as OSS from 'ali-oss';
import * as md5 from 'js-md5';
import * as moment from 'moment';
import * as uuid from 'uuid';
import {Observable} from 'rxjs';
import {LoadingService} from '../services/loading.service';
import {finalize} from 'rxjs/operators';
import {FormGroup} from '@angular/forms';

// region DEMO
/*this.oss.init({
  region: 'oss-cn-beijing',
  accessKeyId: '',
  accessKeySecret: '',
  bucket: '',
  secure: true,
});
this.oss.client.list({ prefix: '0e802692c03b45dd831ed968485b46e5/petHeader/2018-10-17/1539755029894' })
  .then(res => console.log(res));*/
// endregion

/**
 * OSS封装
 * @see https://github.com/ali-sdk/ali-oss?spm=a2c4g.11186623.2.13.39f929161kWpGT#browser-usage
 */
@Injectable()
export class OssService {

  /**
   * 十年的秒数
   */
  public static readonly DECADE = 31536000;

  /**
   * OSS实例
   */
  private _client: OSSClient = null;

  /**
   * 上次初始化OSS实例的配置内容
   */
  private _options: OSSConfig = null;

  constructor(
    private readonly msg: NzMessageService,
    private readonly loading: LoadingService,
  ) { }

  /**
   * 初始化/重新初始化OSS
   * @param config 配置
   */
  public init(config: OSSConfig): OSSClient {
    this._options = config;
    this._client = new OSS(config);
    return this._client;
  }

  /**
   * 复制当前的实例
   * @param config 重载的配置
   */
  public clone(config?: OSSConfig): OSSClient {
    return new OSS(this.cloneOptions(config));
  }

  /**
   * 复制配置
   * @param config 重载的配置
   */
  public cloneOptions(config?: OSSConfig): OSSConfig {
    return Object.assign({}, this.options, config);
  }

  /**
   * 获取签名URL
   * @param name 签名的文件key, 如果文件以任意协议开头(^[a-zA-Z]+://)或为空为null则直接返回该对象
   * @param options 签名使用的参数, 见{@link OSSClient.signatureUrl}
   */
  public sign(name: string, options?: any): string {
    return !name || /^[a-zA-Z]+:\/\//.test(name) ? name : this.client.signatureUrl(name, options);
  }

  /**
   * 图片上传回调
   * @param form 对应的form表单
   * @param e 回调事件
   * @param field 回填的表单字段
   * @param folder 上传至的文件夹
   */
  public onOssUploader(form: FormGroup, e: Event, field: string, folder: string) {
    this.uploadInputChangeEvent(folder, e).subscribe(key => {
      form.get(field + '__url').setValue(this.sign(key));
      form.get(field).setValue(key);
    });
  }

  /**
   * 使用{@link HTMLInputElement}的change事件参数来上传文件
   * @param folder 上传的目录
   * @param e 事件
   */
  public uploadInputChangeEvent(folder: string, e: Event): Observable<string> {
    const files = (e.target as HTMLInputElement).files;
    return new Observable(subscriber => {
      if (files) {
        this.upload(folder, files[0]).subscribe(
          key => subscriber.next(key),
          err => subscriber.error(err),
          () => {
            (e.target as HTMLInputElement).value = '';
            subscriber.complete();
          }
        );
      } else {
        subscriber.error('未找到指定的上传文件!');
      }
    });
  }

  /**
   * 上传文件 -> 自动解析文件计算md5, 避免重复上传
   * @param folder 文件夹
   * @param file 上传的文件
   * @return 文件ID
   */
  public upload(folder: string, file: File): Observable<string> {
    const key = this.loading.requesting(file, true);
    return new Observable<string>(subscriber => {
      // Hash对象
      const hash = md5.create();

      const chunkSize = 2097152;                              // 每次hash的字节 - 2MB
      const chunks = Math.ceil(file.size / chunkSize);     // chunk的数量
      let currentChunk = 0;                                   // 当前chunk
      const fileReader: FileReader = new FileReader();        // Blob转ArrayBuffer

      fileReader.onload = event => {
        // 更新hash
        hash.update((event.target as any).result);
        currentChunk++;

        // 检查是否完成
        if (currentChunk < chunks) {
          // 继续
          loadNext();
        } else {
          // 上传文件
          // 生成唯一文件名称
          const name = OssService.genURL(folder, hash.hex() + OssService.getFileSuffix(file.name, true));

          // 检查文件是否存在
          this.client.list({ prefix: name }).then(list => {
            // 不存在则上传文件
            if (!list.objects || list.objects.length === 0) {
              this.client.put(name, file, {
                headers: {
                  'Content-Disposition': 'inline',
                  'Cache-Control': 'max-age=3600',
                  Expires: '3600000',
                }
              }).then(res => {
                subscriber.next(res.name);
                subscriber.complete();
              }).catch(e => {
                subscriber.error(e);
                subscriber.complete();
              });
            } else {
              subscriber.next(list.objects[0].name);
              subscriber.complete();
            }
          }).catch(e => {
            subscriber.error(e);
            subscriber.complete();
          });

        }
      };
      fileReader.onerror = () => {
        subscriber.error('上传文件失败(计算hash出错), 请重试!');
        subscriber.complete();
      };

      // 循环用的方法
      const loadNext = () => {
        const start = currentChunk * chunkSize;
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      // 开始计算md5
      loadNext();
    }).pipe(
      finalize(() => this.loading.requested(key))
    );
  }

  // region 封装

  get client(): OSSClient {
    if (this._client === null) {
      this.msg.warning('OSS文件系统暂未初始化, 请刷新页面后重试! \r\n如果该问题经常出现, 请联系管理员处理!');
    }
    return this._client;
  }

  get options(): OSSConfig {
    return this._options;
  }

  // endregion

  /**
   * 生成OSS上传路径
   * @param folder prefix: URL前缀/文件夹, dateFolder: 是否自动生成的一个日期文件夹, pattern: 日期文件夹格式(参照moment)
   * @param name 文件名称, 以.开头时随机生成文件名
   * @param useSuffixOnly 为true时, 替换name为它的后缀
   */
  public static genURL(
    folder: string | { prefix: string, dateFolder?: boolean, pattern?: 'yyyy-MM-dd' },
    name?: string, useSuffixOnly: boolean = false
  ): string {
    // 处理文件名
    // 是否截取出文件名的后缀
    if (useSuffixOnly) {
      name = name ? this.getFileSuffix(name, true, name) : null;
    }
    // 处理随机文件名和后缀
    name = name ? name : uuid.v4();
    name = name.length > 1 && name.startsWith('.') ? (uuid.v4() + name) : name;

    // 处理文件夹
    let prefix = typeof folder === 'string' ? folder : folder.prefix;
    prefix = prefix[0] === '/' ? prefix.substring(1) : prefix;
    prefix = prefix[prefix.length - 1] === '/' ? prefix : (prefix + '/');

    if (typeof folder !== 'string') {
      prefix += folder.dateFolder ? moment(new Date()).format(folder.pattern) + '/' : '';
    }

    return prefix + name;
  }

  /**
   * 获取文件后缀名
   * @param name 文件名, 没有.时, 返回空字符串
   * @param withDot 是否带着开头的点
   * @param defaultValue 无法进行剪切时返回的值
   */
  public static getFileSuffix(name: string, withDot: boolean = false, defaultValue: string = ''): string {
    return name.includes('.') && name[name.length - 1] !== '.' ? name.substring(name.lastIndexOf('.') + (withDot ? 0 : 1)) : defaultValue;
  }

}

/**
 * OSS实例代理
 */
/* tslint:disable:max-line-length */
export interface OSSClient {

  [key: string]: any;

  /**
   * List objects in the bucket.
   * @see https://github.com/ali-sdk/ali-oss?spm=a2c4g.11186623.2.13.39f929161kWpGT#listquery-options
   */
  list: (query?: { prefix?: string, marker?: string, delimiter?: string, 'max-keys'?: string }, options?: { timeout?: number }) => Promise<{ isTruncated?: boolean, nextMarker?: any, objects?: { name?: string, lastModified ?: string, etag?: string, type?: string, size?: number, storageClass?: string, owner?: { id?: string, displayName?: string }, url?: string }[] | null, prefixes?: any, res: OSSRes }>;

  /**
   * Add an object to the bucket.
   * @see https://github.com/ali-sdk/ali-oss?spm=a2c4g.11186623.2.13.39f929161kWpGT#putname-file-options
   */
  put: (name: string, file: string | Blob | File, options?: { timeout?: number, mime?: string, meta?: any, callback?: (url: string, host?: string, body?: string, contentType?: string, customValue?: any) => void, headers?: any }) => Promise<OSSPutRes>;

  /**
   * Create a signature url for download or upload object. When you put object with signatureUrl ,you need to pass Content-Type.Please look at the example.
   * @see https://github.com/ali-sdk/ali-oss?spm=a2c4g.11186623.2.13.39f929161kWpGT#signatureurlname-options
   */
  signatureUrl: (name: string, options?: { expires?: number, method?: string, 'Content-Type'?: string, process?: string, response?: { 'content-type'?: string, 'content-disposition'?: string, 'cache-control'?: string }, callback?: { url?: string, host?: string, body: string, contentType?: string, customValue?: string } }) => string;

}

/**
 * OSS上传响应体
 */
export interface OSSPutRes {
  name?: string;
  url?: string;
  data?: any;
  res: OSSRes;
}

/**
 * OSS响应体
 */
export interface OSSRes {
  aborted?: boolean;
  data?: Uint8Array | any;
  headers?: { [key: string]: string } | any;
  keepAliveSocket?: boolean;
  remoteAddress?: string;
  remotePort?: string | number | any;
  requestUrls?: string[] | any;
  rt?: number | any | null;
  size?: number | any | null;
  status?: number | any | null;
  statusCode?: number | any | null;
  timing?: number | any | null;
}

/**
 * OSS初始化配置
 * @see https://github.com/ali-sdk/ali-oss?spm=a2c4g.11186623.2.13.39f929161kWpGT#ossoptions
 */
export interface OSSConfig {
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;

  region?: string;

  stsToken?: string;
  endpoint?: string;
  internal?: boolean;
  secure?: boolean;
  timeout?: string | number;
  cname?: boolean;
  isRequestPay?: boolean;
  useFetch?: boolean;

}
