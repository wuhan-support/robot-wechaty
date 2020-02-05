import { CacheTools } from "./cacheTool";


export class Schedule {
  private static _instance: Schedule;
  public static get Instance(): Schedule {
    return this._instance || (this._instance = new this());
  }

  // 定制器 分钟级别
  public static async minStart () {
    await this.minFunction();
    setInterval(async () => await this.minFunction(), 60000);
  }

  public static async minFunction () {
    CacheTools.requestInfo();
  }
}
