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
export const onQuillImageUpload = async (
  e: Event, editor: QuillEditorComponent,
  oss: OssService, folder: string,
  notSignSuffix: boolean = true
): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    const fileUploader = e.target as HTMLInputElement;
    if (fileUploader.files.length) {
      for (const file of Array.from(fileUploader.files)) {
        await new Promise(fRes => {
          oss.upload(folder, file).subscribe(name => {
            const range = editor.quillEditor.getSelection();
            const signedUrl = oss.sign(name, {expires: OssService.DECADE});
            editor.quillEditor.insertEmbed(
              range.index, 'image',
              notSignSuffix ? signedUrl.substring(0, signedUrl.indexOf('?')) : signedUrl
            );
            editor.quillEditor.insertText(range.index + 1, '\n');
            editor.quillEditor.setSelection(range.index + 2, 0);

            (e.target as HTMLInputElement).value = '';

            editor.onModelChange(editor.valueGetter(editor.quillEditor, editor.editorElem));

            fRes();
          }, err => reject(err));
        });
      }
      resolve();
    }
  });
};
