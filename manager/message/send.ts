import { Contact, Room } from "wechaty";

export class MessageSend {
  public static async send (content: string, target: Contact) {
    await target.say(content);
  }

  public static async mass (content: string, targets: Contact[]) {
    await Promise.all(targets.map(async target => {
      await target.say(content);
    }));
  }
}