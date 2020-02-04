import { Friendship } from 'wechaty';

export const friendshipListener = async (friendship: Friendship) => {
  const type = friendship.type();

  switch (type) {
    case Friendship.Type.Receive:
      await friendship.accept();
      await new Promise(r => setTimeout(r, 1000));
      const contact = friendship.contact();
      await contact.say('你好，我是 wuhan.support 小助手，可以帮你查询疫情信息，你也可以找我订阅疫情信息。如果你订阅的地方疫情有变化，我会第一时间通知你。[可爱]');
      break;

    default:
      break;
  }
  // const content = message.content();
}