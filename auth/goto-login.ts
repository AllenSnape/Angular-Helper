import {Router, UrlSegment} from '@angular/router';
import {InjectionToken, Injector} from '@angular/core';

// 登陆界面配置
export const LOGIN_PATH: InjectionToken<string> = new InjectionToken<string>('默认登陆页面路径');

/**
 * 到登陆界面
 * @param injector 依赖注入器
 * @param path 路径
 */
export const gotoLogin = (injector: Injector, path: string | UrlSegment[] | null = null) => {
  const router = injector.get(Router);
  const loginPath = injector.get(LOGIN_PATH, '/');
  if (path === null) {
    path = router.url;
  } else if (path instanceof Array) {
    path = '/' + path.map(i => i.path).join('/');
  }
  const ignore = router.navigate([ loginPath ], { queryParams: {
    from: path.toString()
  }});
};
