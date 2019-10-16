import {NzTreeNode} from 'ng-zorro-antd';

export class TreeNodeUtils {

  /**
   * 获取所有被checked或half-checked了的node
   * @param nodes 树节点
   * @param list 放结果集的列表
   */
  public static getAllCheckedNode(nodes: NzTreeNode[], list?: NzTreeNode[]): NzTreeNode[] {
    list = list ? list : [];
    for (const node of nodes) {
      if ((node.isChecked || node.isHalfChecked) && !list.includes(node)) {
        list.push(node);
        if (node.getChildren() && node.getChildren().length > 0) {
          this.getAllCheckedNode(node.getChildren(), list);
        }
      }
    }
    return list;
  }

}
