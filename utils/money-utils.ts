/**
 * 关于钱的事儿
 */
export class MoneyUtils {

  /**
   * 将对应的字段除以100
   * @param obj 对象
   * @param defaultValue 默认值
   * @param fields 处理的字段
   */
  public static decentralized<T>(obj: T | any, defaultValue: number = 0, ...fields: string[]): T | any {
    if (obj && fields && fields.length) {
      fields.forEach(field => {
        obj[field] = obj[field] ? obj[field] / 100 : defaultValue;
      });
    }
    return obj;
  }

  /**
   * 将对应的字段乘以100并去除小数
   * @param obj 对象
   * @param defaultValue 默认值
   * @param fields 处理的字段
   */
  public static centralized<T>(obj: T | any, defaultValue: number = 0, ...fields: string[]): T | any {
    if (obj && fields && fields.length) {
      fields.forEach(field => {
        obj[field] = obj[field] ? parseFloat((obj[field] * 100).toFixed(0)) : defaultValue;
      });
    }
    return obj;
  }

  /**
   * 格式化以分为单位的金钱字段
   * @param obj 被格式化的对象
   * @param defaultValue 默认值
   * @param parser 字段处理器
   * @param fields 被格式化的字段
   */
  public static money<T>(
    obj: any | T, defaultValue: number = 0, parser: null | ((field: keyof T | string) => string) = null,
    ...fields: string[]
  ): any | T {
    if (obj && fields && fields.length > 0) {
      fields.forEach(field => {
        if (obj.hasOwnProperty(field)) {
          const key = parser ? parser(field) : parser;
          obj[key as string] = (obj[field] || obj[field] === 0) && !isNaN(obj[field]) ? (obj[field] / 100).toLocaleString() : defaultValue;
        }
      });
    }
    return obj;
  }

}
