import {Injectable} from '@angular/core';
import * as uuid from 'uuid';

/**
 * Loading队列封装
 */
@Injectable()
export class LoadingService {

  /**
   * 请求队列
   */
  private _queue: {[key: string]: any} = {};

  /**
   * 保存mask队列的key
   */
  private _maskQueue: string[] = [];

  /**
   * 添加队列
   * @param obj 对象
   * @param masking 是否需要干预mask
   * @return 队列key
   */
  public requesting(obj: any | null, masking: boolean = false): string {
    const key = uuid.v4();
    this._queue[key] = obj;

    if (masking) {
      this._maskQueue.push(key);
    }

    return key;
  }

  /**
   * 完成队列
   * @param key 队列key
   */
  public requested(key: string): any {
    if (key in this._queue) {
      const req = this._queue[key];
      delete this._queue[key];

      // 检查是否需要操作mask
      const maskIndex =  this._maskQueue.indexOf(key);
      if (maskIndex !== -1) {
        this._maskQueue.splice(maskIndex, 1);
      }

      return req;
    }

    return null;
  }

  /**
   * 队列是否堵塞中
   * @return true: 堵塞中
   */
  public loading(): boolean {
    return Object.keys(this._queue).length !== 0;
  }

  /**
   * 用于标记一些需要指定显示的mask/loading
   */
  public masking(): boolean {
    return this._maskQueue.length !== 0;
  }

  /**
   * 清除所有队列
   */
  public clear(): void {
    this._queue = {};
  }

  get queue(): { [p: string]: any } {
    return this._queue;
  }

}
