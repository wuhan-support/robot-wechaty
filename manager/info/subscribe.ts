import { Message, Contact, Wechaty } from "wechaty";
import { CacheTools } from "../../tools/cacheTool";
import { MessageSend } from "../message/send";
import { InfoQuery } from "./query";
import { CityCacheModel } from "../../config/model";
import { bot } from "../..";

export class InfoSubscribe {
  public static async subscribe (message: Message) {
    const content = message.text();
    if (content.indexOf('订阅') !== 0) {
      return;
    }

    const target = message.from();
    const city = content.replace('订阅', '').trim();
    const cityInfo = CacheTools.getCity(city);
    if (!cityInfo) {
      await MessageSend.send(`订阅${city}失败，该地区名称不正确或暂无疫情信息`, target)
      return;
    }

    let subscripteInfos = CacheTools.getSubscription(city);
    if (!subscripteInfos) {
      subscripteInfos = {};
    }
    subscripteInfos[target.id] = target.id;
    await CacheTools.setSubscription(city, subscripteInfos);
    await MessageSend.send(`您已经成功订阅武汉的疫情，如果有数据更新，我会及时通知您！`, target)
    await InfoQuery.sendCityInfo(city, target);
  }

  public static async mass (newCityInfos: {[city: string]: CityCacheModel}) {
    console.info(`mass ${JSON.stringify(newCityInfos)}`);
    const citys = Object.keys(newCityInfos);
    await Promise.all(citys.map(async city => {
      const cityInfo = newCityInfos[city];
      const content = `${cityInfo.name}目前有确诊病例${cityInfo.confirmed}例，死亡病例${cityInfo.dead}例，治愈病例${cityInfo.cured}例。今日共累计新增确诊病例${cityInfo.suspected}例；`;
      const subscripteInfos = CacheTools.getSubscription(city);
      const targets: Contact[] = [];
      if (subscripteInfos) {
        const contactIds = Object.keys(subscripteInfos);
        contactIds.map(id => {
          const contact = bot.Contact.load(id);
          targets.push(contact);
        });
        await MessageSend.mass(content, targets);
      }
    }));

  }
}