import {QuillEditorComponent} from 'ngx-quill';
import {OssService} from '../aliyun/oss.service';

/**
 * quill编辑器上传图片的操作
 * @param e 回调事件
 * @param editor 编辑器
 * @param oss OSS服务
 * @param folder 上传至的路径
 * @param notSignSuffix 是否需要截取OSS签名后缀
 */
export const onQuillImageUpload = (
  e: Event, editor: QuillEditorComponent,
  oss: OssService, folder: string,
  notSignSuffix: boolean = true
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const fileUploader = e.target as HTMLInputElement;
    if (fileUploader.files[0]) {
      const file = fileUploader.files[0];
      oss.upload(folder, file).subscribe(name => {
        const range = editor.quillEditor.getSelection();
        const signedUrl = oss.sign(name, {expires: OssService.DECADE});
        editor.quillEditor.insertEmbed(
          range.index, 'image',
          notSignSuffix ? signedUrl.substring(0, signedUrl.indexOf('?')) : signedUrl
        );
        editor.quillEditor.setSelection(range.index + 1, 0);

        (e.target as HTMLInputElement).value = '';

        editor.onModelChange(editor.valueGetter(editor.quillEditor, editor.editorElem));

        resolve();
      }, err => reject(err));
    }
  });
};
