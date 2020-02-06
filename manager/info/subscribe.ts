import { Message, Contact, Room } from "wechaty";
import { CacheTools } from "../../tools/cacheTool";
import { MessageSend } from "../message/send";
import { InfoQuery } from "./query";
import { CityCacheModel } from "../../config/model";
import { bot } from "../..";
import { TargetType } from "../../config/enum";

export class InfoSubscribe {
  public static async subscribe (message: Message) {
    let content = message.text().trim();
    if (message.room()) {
      const selfContacts = await message.mentionList();
      selfContacts.map(contact => {
        content = content.replace(`@${contact.name()}`, '');
      })
      content = content.trim();
    }

    let city = ''
    if (content.indexOf('订') !== 0 || content.indexOf('订阅') !== 0) {
      return;
    } else if (content.indexOf('订') === 0) {
      city = content.replace('订', '').trim();
    } else {
      city = content.replace('订阅', '').trim();
    }
    
    let target: Contact | Room | null = message.from();
    const room = message.room();
    if (room) {
      target = bot.Room.load(room.id);
    }
    if (!target) {
      return;
    }
    const cityInfo = CacheTools.getCity(city);
    if (!cityInfo) {
      await MessageSend.send(`订阅${city}失败\n输入不正确或该地区暂无疫情信息`, target)
      return;
    }

    const type = message.room() ? TargetType.Room : TargetType.Contact;
    let subscripteInfos = CacheTools.getSubscription(city, type);
    if (!subscripteInfos) {
      subscripteInfos = {};
    }
    subscripteInfos[target.id] = target.id;
    await CacheTools.setSubscription(city, subscripteInfos, type);
    await MessageSend.send(`订阅${city}成功\n如果疫情信息有更新，我会及时通知您！`, target)
    await InfoQuery.sendCityInfo(city, target);
  }

  public static async delSubscribe (message: Message) {
    let content = message.text().trim();
    if (message.room()) {
      const selfContacts = await message.mentionList();
      selfContacts.map(contact => {
        content = content.replace(`@${contact.name()}`, '');
      })
      content = content.trim();
    }
    if (content.indexOf('取消订阅') !== 0) {
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

    const city = content.replace('取消订阅', '').trim();
    const cityInfo = CacheTools.getCity(city);
    if (!cityInfo) {
      await MessageSend.send(`取消订阅${city}失败\n输入不正确或该地区暂无疫情信息`, target)
      return;
    }

    const type = message.room() ? TargetType.Room : TargetType.Contact;
    let subscripteInfos = CacheTools.getSubscription(city, type);
    if (!subscripteInfos || !subscripteInfos[target.id]) {
      await MessageSend.send(`取消订阅${city}失败\n尚未订阅该地区疫情信息`, target)
      return;
    }
    delete subscripteInfos[target.id];
    await CacheTools.delSubscription(city, subscripteInfos, type);
    await MessageSend.send(`取消订阅${city}成功\n您将不会再收到疫情信息的更新！`, target)
  }

  public static async mass (newCityInfos: {[city: string]: CityCacheModel}) {
    const citys = Object.keys(newCityInfos);
    await Promise.all(citys.map(async city => {
      const cityInfo = newCityInfos[city];
      // TODO 更新新增病例信息
      const content = `${cityInfo.name}目前有：\n确诊${cityInfo.confirmed}例\n治愈${cityInfo.cured}例\n死亡${cityInfo.dead}例\n今日共累计新增确诊病例${cityInfo.suspected}例`;
      const contactInfos = CacheTools.getSubscription(city, TargetType.Contact);
      const contacts: Contact[] = [];
      if (contactInfos) {
        const contactIds = Object.keys(contactInfos);
        contactIds.map(id => {
          const contact = bot.Contact.load(id);
          contacts.push(contact);
        });
        await MessageSend.massContact(content, contacts);
      }

      const roomInfos = CacheTools.getSubscription(city, TargetType.Room);
      const rooms: Room[] = [];
      if (roomInfos) {
        const roomIds = Object.keys(roomInfos);
        roomIds.map(id => {
          const room = bot.Room.load(id);
          rooms.push(room);
        });
        await MessageSend.massRoom(content, rooms);
      }
    }));
  }
}