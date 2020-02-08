import { Message, Contact, Room } from "wechaty";
import { CacheTools } from "../../tools/cacheTool";
import { MessageSend } from "../message/send";
import { bot } from "../..";
import { TargetType, ShimoStatus } from "../../config/enum";
import { shimo } from "../../config/base";

export class InfoShimo {
  public static async process (message: Message) {
    switch (shimo.status) {
      case ShimoStatus.Prepare:
        await this.init(message);
      case ShimoStatus.Init:
        await this.setUserName(message);
      case ShimoStatus.Settle:
        await this.setUrl(message);
      break;
    }
  }
  public static async init (message: Message) {
    let content = message.text().trim();
    // set clientId and and clientSecret here.
    let [clientId, clientSecret] = content.replace('石墨登录', '').trim().split("\n"); 
    shimo.init(clientId, clientSecret)
  }

  public static async setUserName (message: Message) {
    let content = message.text().trim();
    // set userName here.
    let userName = content.replace('石墨用户名', '').trim(); 
    shimo.setUserName(userName)
  }

  public static async setUrl (message: Message) {
    let content = message.text().trim();
    // set Url here.
    let url = content.replace('石墨链接', '').trim(); 
    shimo.setUrl(url)
  }
}