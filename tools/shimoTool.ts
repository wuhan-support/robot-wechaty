import request = require('request');
import { ShimoStatus } from "../config/enum";

class Shimo {

  clientId: string;
  clientSecret: string;
  userName: string;
  scope: string;
  url: string;
  status: string; // TODO 这里应该声明什么类型啊？ 最简单的是string 但是不是很好
  token: string;
  files: Map<string, string>;

  constructor(clientId: string = '', clientSecret: string = '', userName: string = '', scope: string = '', url: string = '', status = ShimoStatus.Prepare) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.userName = userName;
      this.url = url;
      this.scope = scope;
      this.status = status;
      this.files = new Map<string, string>()
  }

  public init (clientId: string, clientSecret: string) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.setStatus(ShimoStatus.Init);
  }

  public setUserName (userName: string) {
      this.userName = userName;
      this.setStatus(ShimoStatus.Settle);
  }
  public getUserName () {
    return this.userName;
}

  public setUrl (url: string) {
      this.url = url;
      this.setStatus(ShimoStatus.Ready);
  }
  public getUrl () {
    return this.url;
  }

  public setStatus (status) {
      this.status = status;
      // this.setStatus(ShimoStatus.Init); // TODO: 应该不需要
  }

  // public getGuids () { // TODO: 这个函数是要干什么用
  //   this.files.set(name, guid);
  // }

  public addGuid (name: string, guid: string) {
    this.files.set(name, guid);
  }

  public getGuid (name: string) {
    this.files.get(name)
  }

  public async getToken (options?: any) {
    const body = Object.assign({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      scope: this.scope,
      grantType: 'client_credentials',
      clientUserId: `shimo_cabinet_${this.getUserName()}`
    }, options)

    let token: any;

    await request({
      url: this.getUrl() + '/oauth2/token',
      method: 'POST',
      json: true,
      body,
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          const jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
          token = jsonStr;
        }
      }
    });
    return token;
  }

  public async createFile (data) {
    const token = await this.getToken()
    let jsonStr: any;
    await request({
      url: this.getUrl() + '/files',
      method: 'POST',
      json: true,
      body: data,
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

    return jsonStr;
  }

  public async importFile (data) {
    const token = await this.getToken()
    let jsonStr: any;
    await request({
      url: this.getUrl() + '/files/import',
      method: 'POST',
      json: true,
      body: data,
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });
    return jsonStr;
  }

  /**
   * @param {string} guid
   * @returns {Promise.<{ file, token }>}
   */
  public async addFiles (guid: string, level: number) {
    const token = await this.getToken({
      info: {
        fileGuid: guid,
        filePermissions: {
          readable: true,
          editable: true,
          commentable: true
        }
      }
    });
    let jsonStr: any;
    await request({
      url: this.getUrl() + `/files?folder=${guid}&level=${level}`,
      method: 'GET',
      json: true,
      query: {
        withConfig: true
      },
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

  }

  /**
   * @param {string} guid
   * @returns {Promise.<{ file, token }>}
   */
  public async getFile (name: string) {
    const guid = this.getGuid(name)
    const token = await this.getToken({
      info: {
        fileGuid: guid,
        filePermissions: {
          readable: true,
          editable: true,
          commentable: true
        }
      }
    });
    let jsonStr: any;
    await request({
      url: this.getUrl() + `/files/${guid}`,
      method: 'GET',
      json: true,
      query: {
        withConfig: true
      },
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
          // TODO: 举例 应该怎么输出 根据数据可以定一下类型
          // TODO: 数组
          // jsonStr.map(data => {
          //   console.info(`get file data: ${JSON.stringify(data)}`);
          // })
          // TODO: json类型
          // console.info(`get file data: ${JSON.stringify(data)}`);
        }
      }
    });

    return jsonStr;
  }

  /**
   * @param {string} name
   * @param {string} [toType]
   * @returns {Promise.<{ file, token }>}
   */
  public async exportFile (name: string, toType: string) {
    const guid = this.getGuid(name)
    const token = await this.getToken({
      info: {
        fileGuid: guid,
        filePermissions: {
          readable: true,
          editable: true,
          commentable: true
        }
      }
    });
    let jsonStr: any;
    await request({
      url: this.getUrl() + `/files/${guid}/export`,
      method: 'GET',
      json: true,
      query: { toType },
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

    return jsonStr;
  }

  public async deleteFile (name: string) {
    const guid = this.getGuid(name)
    const token = await this.getToken({
      info: {
        fileGuid: guid,
        filePermissions: {
          readable: true,
          editable: true,
          commentable: true
        }
      }
    });
    let jsonStr: any;
    await request({
      url: this.getUrl() + `/files/${guid}`,
      method: 'DELETE',
      json: true,
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

    return jsonStr;
  }

  /**
   * @param {string} guid
   * @param {string} title
   */
  public async updateTitle (name: string, title: string) {
    const guid = this.getGuid(name)
    const token = await this.getToken({
      info: {
        fileGuid: guid,
        filePermissions: {
          readable: true,
          editable: true,
          commentable: true
        }
      }
    });
    let jsonStr: any;
    await request({
      url: this.getUrl() + `/files/${guid}/title`,
      method: 'PATCH',
      json: true,
      body: { name: title },
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

    return jsonStr;
  }

  /**
   * A proxy for Shimo API
   * @param {string} url
   * @param {object} options
   * @param {object} [options.body]
   * @param {object} [options.method]
   * @param {object} [options.query]
   * @param {object} [options.headers]
   */
  async proxy (url: string, options:any = {}) {
    if (options.headers) {
      delete options.headers.host
    }

    let jsonStr: any;
    await request({
      url,
      method: options.method,
      json: true,
      body: options.body,
      query: options.query,
      headers: options.headers,
    }, (err: Error, res: any, body: any) => {
      if (err) {
        console.error('request shimo info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          jsonStr = JSON.parse(body);
          console.info(`request shimo get token success`);
        }
      }
    });

    return jsonStr;
  }
}

export let shimo = new Shimo();