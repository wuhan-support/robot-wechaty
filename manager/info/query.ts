import { Contact, Message, Room } from 'wechaty';
import { CacheTools } from '../../tools/cacheTool';
import { MessageSend } from '../message/send';

export class InfoQuery {
  public static async queryCity (message: Message) {
    let content = message.text().trim();
    const room = message.room();
    const mentionSelf = message.mentionSelf();

    if (room && mentionSelf) {
      const selfContacts = await message.mentionList();
      for (const contact of selfContacts) {
        content = content.replace(`@${contact.name()}`, '');
        content = content.replace(`@${await room.alias(contact)}`, '');
      }
      content = content.trim();
    }
    
    let city = ''
    if (content.indexOf('查') !== 0 || content.indexOf('查询') !== 0) {
      return;
    } else if (content.indexOf('查') === 0) {
      city = content.replace('查', '').trim();
    } else {
      city = content.replace('查询', '').trim();
    }

    let target: Contact | Room | null = message.from();
    if (room) {
      target = room;
    }
    if (!target) {
      return;
    }

    await this.sendCityInfo(city, target);
  }

  public static async sendCityInfo (city: string, target: Contact | Room) {
    const cityInfo = CacheTools.getCity(city);
    let content = `查询${city}失败，该地区名称不正确或暂无疫情信息`
    if (cityInfo) {
      // TODO 更新新增病例信息
      content = `${cityInfo.name}目前有确诊病例${cityInfo.confirmed}例，死亡病例${cityInfo.dead}例，治愈病例${cityInfo.cured}例。今日共累计新增确诊病例${cityInfo.suspected}例；`;
    }
    await MessageSend.send(content, target);
  }
}