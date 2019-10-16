/**
 * JSON工具类
 */
export class JsonUtils {

  /**
   * 格式化JSON字符串
   * @param json JSON字符串
   * @param defaultValue 解析失败时的默认值
   * @param reviver 自定义格式化方法
   */
  public static jsonParse<T>(json: any, defaultValue: T | any = null, reviver?: (this: any, key: string, value: any) => any): T | any {
    try {
      json = JSON.parse(json, reviver);
      json = json !== null ? json : defaultValue;
    } catch {
      json = defaultValue;
    }
    return json;
  }

  /**
   * 格式化JSONArray字符串
   * @param json JSONArray字符串
   * @param defaultValue 解析失败或解析出来不是数组时的默认值
   * @param reviver 自定义格式化方法
   */
  public static jsonArrayParse<T>(
    json: any, defaultValue: T[] | any[] = [],
    reviver?: (this: any, key: string, value: any) => any
  ): T[] | any[] {
    json = this.jsonParse(json, defaultValue, reviver);
    return json instanceof Array ? json : defaultValue;
  }

}
