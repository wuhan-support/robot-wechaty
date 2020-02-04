import { Contact, Message } from "wechaty";
import { CacheTools } from "../../tools/cacheTool";
import { MessageSend } from "../message/send";

export class InfoQuery {
  public static async queryCity (message: Message) {
    const content = message.text();
    if (content.indexOf('查') !== 0) {
      return;
    }

    const target = message.from();
    if (target === null) {
      return;
    }
    const city = content.replace('查', '').trim();
    await this.sendCityInfo(city, target);
  }

  public static async sendCityInfo (city: string, target: Contact) {
    const cityInfo = CacheTools.getCity(city);
    let content = `查询${city}失败，该地区名称不正确或暂无疫情信息`
    if (cityInfo) {
      content = `${cityInfo.name}目前有确诊病例${cityInfo.confirmed}例，死亡病例${cityInfo.dead}例，治愈病例${cityInfo.cured}例。今日共累计新增确诊病例${cityInfo.suspected}例；`;
    }
    await MessageSend.send(content, target);
  }
}