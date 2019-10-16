import * as moment from 'moment';

export class DateUtils {

  public static readonly DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  public static readonly DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
  public static readonly ISO8601_FULL_8 = 'YYYY-MM-DDTHH:mm:ss.000+0800';
  public static readonly ISO8601_EMPTY_TIME = 'YYYY-MM-DDT00:00:00';

  /**
   * 格式化日期为字符串
   * @param date 整理的日期
   * @param pattern 日期格式
   * @param defaultValue 无法整理时的日期格式
   */
  public static dateStringFormat(date: any, pattern: string, defaultValue?: string): string {
    return date && moment(date).isValid() ? moment(date).format(pattern) : defaultValue;
  }

  /**
   * 格式化对象中的日期字段为指定格式
   * @param obj 格式化的列表
   * @param pattern 日期格式
   * @param defaultValue 无法整理时的日期格式
   * @param fieldParser 日期字段处理, 为NULL时直接覆盖
   * @param fields 格式化的字段
   */
  public static objDateStringFormat<T>(
    obj: T, pattern: string, defaultValue: string, fieldParser: ((field: string) => string) | null,
    ...fields: (keyof T)[]
  ): T {
    if (obj && fields && fields.length) {
      fields.forEach(field => {
        if (obj.hasOwnProperty(field)) {
          obj[fieldParser ? fieldParser(field as string) : (field as string)] = this.dateStringFormat(obj[field], pattern, defaultValue);
        }
      });
    }
    return obj;
  }

  /**
   * 格式化列表中的日期字段为指定格式
   * @param list 格式化的列表
   * @param pattern 日期格式
   * @param defaultValue 无法整理时的日期格式
   * @param fieldParser 日期字段处理, 为NULL时直接覆盖
   * @param fields 格式化的字段
   */
  public static listDateStringFormat<T>(
    list: T[], pattern: string, defaultValue: string, fieldParser: ((field: string) => string) | null,
    ...fields: (keyof T)[]
  ): T[] {
    if (list && list.length && fields && fields.length) {
      list.forEach(item => {
        this.objDateStringFormat(item, pattern, defaultValue, fieldParser, ...fields);
      });
    }
    return list;
  }

  /**
   * 格式化字符串日期
   * @param date 整理的日期
   * @param defaultValue 无法整理时的日期格式
   */
  public static dateFormat(date: any, defaultValue?: Date): Date {
    return date && moment(date).isValid() ? moment(date).toDate() : defaultValue;
  }

  /**
   * 格式化对象内的日期字段
   * @param obj 被格式化的对象
   * @param defaultValue 默认值
   * @param fieldParser 日期字段处理, 为NULL时直接覆盖
   * @param fields 格式化的字段
   */
  public static objectDateFormat<T>(
    obj: T, defaultValue: Date | null, fieldParser: ((field: string) => string) | null,
    ...fields: (keyof T)[]
  ): T {
    if (obj && fields && fields.length) {
      fields.forEach(field => {
        if (obj.hasOwnProperty(field)) {
          obj[fieldParser ? fieldParser(field as string) : (field as string)] = this.dateFormat(obj[field], defaultValue);
        }
      });
    }
    return obj;
  }

}
