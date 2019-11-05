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

/**
 * 预设时间区间集
 */
export const INTERVALS = {
  today: (): Date[] => {
    const st = new Date();
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  tomorrow: (): Date[] => {
    const st = new Date();
    st.setDate(st.getDate() + 1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setDate(et.getDate() + 1);
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  yesterday: (): Date[] => {
    const st = new Date();
    st.setDate(st.getDate() - 1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setDate(et.getDate() - 1);
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'this week': (): Date[] => {
    const st = new Date();
    st.setDate(st.getDate() - st.getDay() + 1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setDate(et.getDate() + 7 - st.getDay());
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'last 7 day': (): Date[] => {
    const st = new Date();
    st.setDate(st.getDate() - 7);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'next 7 day': (): Date[] => {
    const st = new Date();
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setDate(et.getDate() + 7);
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'this month': (): Date[] => {
    const st = new Date();
    st.setDate(1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setDate(getMonthDay(et.getMonth() + 1, et.getFullYear()));
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'last month': (): Date[] => {
    const st = new Date();
    st.setMonth(st.getMonth() - 1, 1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setMonth(et.getMonth() - 1, getMonthDay(et.getMonth(), et.getFullYear()));
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
  'next month': (): Date[] => {
    const st = new Date();
    st.setMonth(st.getMonth() + 1, 1);
    st.setHours(0, 0, 0, 0);

    const et = new Date();
    et.setMonth(et.getMonth() + 1, getMonthDay(et.getMonth(), et.getFullYear()));
    et.setHours(23, 59, 59, 999);

    return [st, et];
  },
};

/**
 * 获取月份的天数
 * @param month 月份
 * @param year 年份
 */
export const getMonthDay = (month: number, year: number = new Date().getFullYear()): number => {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12: return 31;
    case 2: return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
    default: return 30;
  }
};

