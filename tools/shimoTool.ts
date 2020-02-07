import request = require('request');
import { shimoClientId, shimoClientSecret, shimoUserName, shimoUrl } from '../config/base';

export class shimoTool {
  public static async getToken (options?: any) {
    const body = Object.assign({
      clientId: shimoClientId,
      clientSecret: shimoClientSecret,
      scope: 'write',
      grantType: 'client_credentials',
      clientUserId: `shimo_cabinet_${shimoUserName}`
    }, options)

    let token: any;

    await request({
      url: shimoUrl + '/oauth2/token',
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

  public static async createFile (data) {
    const token = await this.getToken()
    let jsonStr: any;
    await request({
      url: shimoUrl + '/files',
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

  public static async importFile (data) {
    const token = await this.getToken()
    let jsonStr: any;
    await request({
      url: shimoUrl + '/files/import',
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
  public static async getFile (guid) {
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
      url: shimoUrl + `/files/${guid}`,
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

    return jsonStr;
  }

  /**
   * @param {string} guid
   * @param {string} [toType]
   * @returns {Promise.<{ file, token }>}
   */
  public static async exportFile (guid, toType) {
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
      url: shimoUrl + `/files/${guid}/export`,
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

  public static async deleteFile (guid) {
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
      url: shimoUrl + `/files/${guid}`,
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
  public static async updateTitle (guid, title) {
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
      url: shimoUrl + `/files/${guid}/title`,
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