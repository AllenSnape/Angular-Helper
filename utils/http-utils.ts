import {environment} from '../../../environments/environment';
import {HttpUrlEncodingCodec} from '@angular/common/http';

/**
 * 获取链接
 * @param uri 链接
 * @param suffixes 后缀内容
 */
export const url = (uri: string, ...suffixes: any[]) => {
  return (
      environment.host[environment.host.length - 1] === '/' ?
        environment.host.substring(0, environment.host.length - 1) : environment.host
    ) +
    uri + (suffixes && suffixes.length ? '/' + suffixes.join('/') : '');
};

export class HttpParamsEncoder extends HttpUrlEncodingCodec {

  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

}
