import {AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * 表单工具类
 */
export class FormUtils {

  /**
   * 标记form为dirty, 并更新其验证信息
   * @param form 被标记的form
   */
  public static dirtyForm(form: FormGroup): void {
    for (const i in form.controls) {
      form.controls[i].markAsDirty();
      form.controls[i].updateValueAndValidity();
    }
  }

  /**
   * 获取表单非null非空的数据
   * @param form 表单对象
   */
  public static getNonnullValue(form: FormGroup): { [key: string]: any } {
    const data = form.getRawValue();
    for (const i in data) {
      if (data.hasOwnProperty(i) && (data[i] === undefined || data[i] === null || data[i] === '')) delete data[i];
    }
    return data;
  }

  /**
   * 自己与自己, 或与其中的ID进行对比
   * @param o1 对象1号
   * @param o2 对象2号
   */
  public static compareWithIdAndItself = (o1: any, o2: any): boolean => {
    return o1 === o2 || (o1 && o2 && (o1.id || o1.id === 0 || o1.id === '') && (o2.id || o2.id === 0 || o2.id === '') && o1.id === o2.id);
  }

}

// region 动态表单

/**
 * 动态表单
 */
export interface DynamicForm {
  /**
   * key: 原来的名称
   */
  [key: string]: DynamicFormItem;
}

/**
 * 动态表单配置
 */
export interface DynamicFormItem {
  // 表单控制器名称, 推荐: name + Math.random();
  name: string;
  // 表单对象
  control: FormControl;

  // 其他自定义参数
  [key: string]: any;
}

/**
 * 根据简单配置生成controlName为key+Math.random()的动态表单配置
 * @param items 简单配置, FormControl的表单验证器
 * @param fb 表单构建器
 * @param item 回填的数据/默认值
 */
export const genDynamicForm = <T>(
  items: {
    [key: string]: [
      (ValidatorFn | ValidatorFn[] | AsyncValidatorFn | null)?,
      (AsyncValidatorFn | AsyncValidatorFn[] | null)?
    ] | null
  },
  fb: FormBuilder,
  item?: T | any,
): DynamicForm => {
  const form: DynamicForm = {};
  for (const key in items) {
    if (items.hasOwnProperty(key)) {
      form[key] = {
        name: key + Math.random(),
        control: fb.control(
          item ? item[key] : null,
          items[key] && items[key][0] ? items[key][0] : undefined,
          items[key] && items[key][1] ? items[key][1] : undefined
        )
      };
    }
  }
  return form;
};

/**
 * 操作动态表单配置
 * @param form 添加至的表单
 * @param config 配置信息
 * @param operation 操作类型, add添加到form, remove: 移除
 */
export const opeDynamicForm = (
  form: FormGroup, config: DynamicForm, operation: 'addControl' | 'removeControl' = 'addControl'
): DynamicForm => {
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      form[operation](config[key].name, config[key].control);
    }
  }
  return config;
};

/**
 * 导出动态表单数据
 * @param form 表单对象
 * @param configs 动态表单配置
 */
export const exportDynamicForm = <T>(form: FormGroup, configs: DynamicForm[]): T[] => {
  const values: T[] = [];
  for (const config of configs) {
    const item = {};
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        item[key] = config[key].control.value;
      }
    }
    values.push(item as T);
  }
  return values;
};

/**
 * 清空表单控件和表单配置
 * @param form 清除的表单
 * @param configs 清除的配置
 */
export const clearDynamicFormAndConfig = (form: FormGroup, configs: DynamicForm[]): void => {
  // 初始化表单
  while (configs.length > 0) {
    opeDynamicForm(form, configs.splice(0, 1)[0], 'removeControl');
  }
};

// endregion

/**
 * 数组字段长度验证 -> 不验空的, 需要必填验证请添加{@link Validators#required}
 * @param minLength 最小长度
 * @param maxLength 最大长度
 */
export const arrayFieldLengthRequired = (minLength: number = 3, maxLength?: number) => {
  return (control: AbstractControl): ValidationErrors | null =>
    control && control.value instanceof Array && control.value.length &&
    (control.value.length < minLength || (maxLength && control.value.length > maxLength)) ? {length: true} : null;
};

/**
 * 最小字段大于了最大字段
 * @param min 最小字段的控件
 * @param form 表单对象
 * @param maxField 最大字段名称
 * @param errorName 错误名称
 */
export const moreThanMax = (
  min: AbstractControl, form: FormGroup, maxField: string, errorName: string = 'moreThanMax'
): null | {[key: string]: any} => {
  if (!form) return null;
  const max = form.get(maxField);
  if (max && (max.value || max.value === 0)) {
    if (max.value < min.value) {
      return { [errorName]: true };
    } else if (max.invalid) {
      max.updateValueAndValidity();
    }
  }
  return null;
};

/**
 * 最大字段小于了最小字段
 * @param max 最大字段的控件
 * @param form 表单对象
 * @param minField 最小字段名称
 * @param errorName 错误名称
 */
export const lessThanMin = (
  max: AbstractControl, form: FormGroup, minField: string, errorName: string = 'lessThanMin'
): null | {[key: string]: any} => {
  if (!form) return null;
  const min = form.get(minField);
  if (min && (min.value || min.value === 0)) {
    if (min.value > max.value) {
      return { [errorName]: true };
    } else if (min.invalid) {
      min.updateValueAndValidity();
    }
  }
  return null;
};
