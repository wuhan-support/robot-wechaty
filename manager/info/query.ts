import { Contact, Message, Room } from "wechaty";
import { CacheTools } from "../../tools/cacheTool";
import { MessageSend } from "../message/send";
import { bot } from "../..";

export class InfoQuery {
  public static async queryCity (message: Message) {
    let content = message.text().trim();
    if (message.room()) {
      const selfContacts = await message.mentionList();
      selfContacts.map(contact => {
        content = content.replace(`@${contact.name()}`, '');
      })
      content = content.trim();
    }

    if (content.indexOf('查') !== 0) {
      return;
    }
    let target: Contact | Room | null = message.from();
    const room = message.room();
    if (room) {
      target = bot.Room.load(room.id);
    }

    if (!target) {
      return;
    }

    const city = content.replace('查', '').trim();
    await this.sendCityInfo(city, target);
  }

  public static async sendCityInfo (city: string, target: Contact | Room) {
    const cityInfo = CacheTools.getCity(city);
    let content = `查询${city}失败，该地区名称不正确或暂无疫情信息`
    if (cityInfo) {
      content = `${cityInfo.name}目前有确诊病例${cityInfo.confirmed}例，死亡病例${cityInfo.dead}例，治愈病例${cityInfo.cured}例。今日共累计新增确诊病例${cityInfo.suspected}例；`;
    }
    await MessageSend.send(content, target);
  }
}