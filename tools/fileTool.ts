import * as fs from 'fs';
import { promisify } from 'util';

const fileRead = promisify(fs.readFile);

export class FileOperate {
  // 异步
  public static write (fileName: string, content: any) {
    const filePath = './config/' + fileName + '.json';
    fs.writeFile(filePath, content, {flag: "w"}, function (err) {
      if (err) {
        console.info(err);
      } else {
        console.info(`写入${filePath}文件成功`);
      }
    })
  }

  // 同步
  public static async read (fileName: string) {
    let data: any = {};
    try {
      const filePath = './config/' + fileName + '.json';
      data = JSON.parse((await fileRead(filePath)).toString());
      console.info(`读取${filePath}文件成功`);
    } catch (error) {
      console.info(error);
    }
    return data;
  }
}