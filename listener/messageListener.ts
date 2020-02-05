import { Message } from 'wechaty';
import { MessageType } from 'wechaty-puppet'
import { InfoSubscribe } from '../manager/info/subscribe';
import { InfoQuery } from '../manager/info/query';

export const messageListener = async (message: Message) => {
  const contact = message.from();
  
  const bFlag = await message.mentionSelf();
  const room = message.room();
  if ((room && !bFlag) || (!room && !contact)) {
    return;
  }

  const msgType = message.type();
  switch (msgType) {
    case MessageType.Text:
      await InfoSubscribe.subscribe(message);
      await InfoSubscribe.delSubscribe(message);
      await InfoQuery.queryCity(message);
      break;
  }
}