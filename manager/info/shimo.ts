import { Message } from "wechaty";
import { ShimoStatus } from "../../config/enum";
import { shimo } from "../../tools/shimoTool";

export class InfoShimo {
  public static async process (message: Message) {
    switch (shimo.status) {
      case ShimoStatus.Prepare:
        await this.init(message);
        break;
      case ShimoStatus.Init:
        await this.setUserName(message);
        break;
      case ShimoStatus.Settle:
        await this.setUrl(message);
        break;
      case ShimoStatus.Ready:
        await this.fileProcess(message);
        break;
    }
  }
  public static async init (message: Message) {
    let content = message.text().trim();
    if (content.indexOf('石墨登录') !== 0) {
        return;
    }
    // set clientId and and clientSecret here.
    let [clientId, clientSecret] = content.replace('石墨登录', '').trim().split("\n");
    shimo.init(clientId, clientSecret)
  }

  public static async setUserName (message: Message) {
    let content = message.text().trim();
    if (content.indexOf('石墨用户名') !== 0) {
        return;
    }
    // set userName here.
    let userName = content.replace('石墨用户名', '').trim(); 
    shimo.setUserName(userName)
  }

  public static async setUrl (message: Message) {
    let content = message.text().trim();
    if (content.indexOf('石墨链接') !== 0) {
        return;
    }
    // set Url here.
    let url = content.replace('石墨链接', '').trim(); 
    shimo.setUrl(url)
  }

  public static async fileProcess (message: Message) {
    let content = message.text().trim();

    if (content.indexOf('添加文件') === 0) {
        // let [name, guid] = content.replace('添加文件', '').trim().split("\n"); 
        // TODO: 没有这个函数 应该是 createFile 吧
        // shimo.addFile(name, guid)
    } else if (content.indexOf('添加文件夹') === 0) {
        // let [name, guid] = content.replace('添加文夹', '').trim().split("\n");
        // TODO: 参数传递有问题 需要确认下是接口定义参数错误 还是 参数传递问题
        // shimo.addFiles(name, guid)
    }
  }
}
