/**
 * 树的工具类
 */
export class TreeUtils {

  /**
   * 整理列表数据至树形数据
   * @param list              整理的列表
   * @param topLevelId        根ID
   * @param sort              排序字段名称
   * @param id                ID对比字段名称
   * @param parentId          父节点字段名称
   * @param isLeaf            是否为叶子节点(末端节点)的节点
   * @param children          子节点字段名称
   * @returns 一个树形Array
   */
  public static list2Tree<T>(
    list: Array<T>, topLevelId: string = null,
    sort: string = 'sort', id: string = 'id', parentId: string = 'parentId',
    isLeaf: string = 'isLeaf', children: string = 'children',
  ): Array<T> | null {

    // 检查参数
    if (!list) {
      return null;
    }

    // 模拟一个"超顶级"的菜单来装顶级菜单
    const root = {};
    root[id] = topLevelId;
    root[children] = [];
    return this.list2TreeFormatter(root, list, sort, id, parentId, isLeaf, children)[children];
  }

  /**
   * list2Tree的递归方法
   * @param parent            根
   * @param list              列表
   * @param sort              排序字段名称
   * @param id                ID对比字段名称
   * @param parentId          父节点字段名称
   * @param isLeaf            是否为叶子节点(末端节点)的节点
   * @param children          子节点字段名称
   */
  private static list2TreeFormatter<T>(
    parent: T, list: Array<T>,
    sort: string = 'sort', id: string = 'id', parentId: string = 'parentId',
    isLeaf: string = 'isLeaf', children: string = 'children',
  ): T {
    // 循环查询
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      // 跳过null
      if (item === null) continue;
      // 匹配子菜单
      if (parent[id] === item[parentId]) {
        // 查询菜单子数组是否存在, 不存在则初始化一个数组
        parent[children] = parent[children] && parent[children] instanceof Array ? parent[children] : [];
        // 将其设置null, 避免菜单数据依赖循环
        list[i] = null;
        // 检查该子菜单是否有子菜单
        this.list2TreeFormatter(item, list.slice(), sort, id, parentId, isLeaf, children);
        // 将子菜单放入
        parent[children].push(item);
      }
    }
    // 叶子节点标识符
    if (isLeaf && (!parent[children] || parent[children].length === 0)) {
      parent[isLeaf] = true;
    }
    // 排序菜单
    if (sort && parent[children]) {
      parent[children].sort((a, b) => {
        return a[sort] - b[sort];
      });
    }
    return parent;
  }

  /**
   * 整理树对象为NG-ZORRO合适的树对象
   * @param ts 源树对象
   * @param titleField 放入title字段的字段名称
   * @param keyField 放入key字段的字段名称
   * @param childrenField 放入children字段的字段名称
   * @param sort 排序操作
   */
  public static parse2NzTreeNode<T>(
    ts: T[],
    titleField: string = 'title', keyField: string = 'key', childrenField: string = 'children',
    sort?: (a: TreeNode<T>, b: TreeNode<T>) => number
  ): TreeNode<T>[] {
    return this.parseTree2AnotherTree<T, TreeNode<T>>(ts, ((t, children) => {
      return { title: t[titleField], key: t[keyField], t, isLeaf: !children, [childrenField]: children };
    }), childrenField, sort);
  }

  /**
   * 将一个树转换成另一个树
   * @param sourceTree 源树数据
   * @param converter 转换器
   * @param childrenField 子树字段名称
   * @param sort 排序方法
   */
  public static parseTree2AnotherTree<T, A>(
    sourceTree: T[],
    converter: (t: T, children?: A[]) => A,
    childrenField: string = 'children',
    sort?: (a: A, b: A) => number,
  ): A[] {
    const results = [];
    for (const t of sourceTree) {
      let children: A[];
      if (t[childrenField] && t[childrenField] instanceof Array && t[childrenField].length > 0) {
        children = this.parseTree2AnotherTree(t[childrenField], converter, childrenField, sort);
      }
      const result = converter(t, children);
      results.push(result);
    }
    return results.sort(sort);
  }

  /**
   * 找到第一个匹配tree[][valueField] === value的路径
   * @param value 匹配的值
   * @param tree 检索的树
   * @param valueField 匹配值的字段名称
   * @param childrenField 子树的字段名称
   */
  public static retrieve<T>(value: any, tree: T[], valueField: string = 'value', childrenField: string = 'children'): T[] {
    for (const t of tree) {
      if (t[valueField] === value) {
        return [ t ];
      }
      if (t[childrenField] && t[childrenField] instanceof Array && t[childrenField].length > 0) {
        const found: T[] = this.retrieve(value, t[childrenField], valueField, childrenField);
        if (found && found.length > 0) {
          return [ t, ...found ];
        }
      }
    }
    return [];
  }

  /**
   * 将tree转为list
   * @param ts 需要被格式化的内容
   * @param childrenField 对象中的子列表的字段名称
   * @param list 放入的list
   */
  public static flatiallize<T>(ts: T[], childrenField: string = 'children', list?: T[]): T[] {
    list = list ? list : [];
    for (const t of ts) {
      if (!list.includes(t)) {
        list.push(t);
      }
      if (t[childrenField] && t[childrenField].length > 0) {
        this.flatiallize(t[childrenField], childrenField, list);
      }
    }
    return list;
  }

}

export interface TreeNode<T> {

  /**
   * 菜单名称
   */
  title: string;

  /**
   * 菜单ID
   */
  key: string;

  /**
   * 源对象
   */
  t: T;

  /**
   * 子菜单集合
   */
  children?: TreeNode<T>[];

  /**
   * 是否有子菜单
   */
  isLeaf?: boolean;

}
