import { Message } from 'wechaty';
import { MessageType } from 'wechaty-puppet'
import { InfoSubscribe } from '../manager/info/subscribe';
import { InfoQuery } from '../manager/info/query';

export const messageListener = async (message: Message) => {
  if (message.room()) {
    return;
  }

  const msgType = message.type();
  switch (msgType) {
    case MessageType.Text:
      await InfoSubscribe.subscribe(message);
      await InfoQuery.queryCity(message);
      break;
  }
  const conent = message.content();
}