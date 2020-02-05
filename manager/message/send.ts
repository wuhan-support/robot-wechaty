import { Contact, Room } from "wechaty";

export class MessageSend {
  public static async send (content: string, target: Contact | Room) {
    await target.say(content);
  }

  public static async massContact (content: string, targets: Contact[]) {
    await Promise.all(targets.map(async target => {
      await target.say(content);
    }));
  }

  public static async massRoom (content: string, targets: Room[]) {
    await Promise.all(targets.map(async target => {
      await target.say(content);
    }));
  }
}
