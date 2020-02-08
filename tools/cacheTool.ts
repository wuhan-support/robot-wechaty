import NodeCache = require('node-cache');
import { epidemicUrl } from '../config/base';
import { CityCacheModel, FileSubscripteModel, InfoModel } from '../config/model';
import { InfoSubscribe } from '../manager/info/subscribe';
import { FileOperate } from './fileTool';
import request = require('request');

export class CacheTools {
  private static cache = new NodeCache();

  public static getCity (content: string) {
    let text = content;
    if (text === '中国') {
      return this.cache.get<CityCacheModel>('中国') || false;
    }

    const provinceKey = `province-${text.substr(0, 2)}`;
    const provinceInfo = this.cache.get<CityCacheModel>(provinceKey);
    if (provinceInfo) {
      text = text.replace(provinceInfo.name, '');
      if (text.length === content.length) {
        text = text.replace(provinceInfo.shortName, '');
      }
    }

    if (provinceInfo && text.length === 0) {
      return provinceInfo;
    }

    const cityKey = `city-${text.substr(0, 2)}`;
    const cityInfo = this.cache.get<CityCacheModel>(cityKey);
    if (cityInfo) {
      return cityInfo;
    }
    return false;
  }

  private static async initCity (listByArea: InfoModel[]) {
    const chinaInfo: CityCacheModel = {
      name: '中国',
      shortName: '',
      confirmed: 0,
      suspected: 0,
      cured: 0,
      dead: 0,
    }
    const newCityInfos:{[city: string]: CityCacheModel} = {};
    listByArea.map(info => {
      chinaInfo.confirmed = chinaInfo.confirmed + info.confirmed;
      chinaInfo.suspected = chinaInfo.suspected + info.suspected;
      chinaInfo.cured = chinaInfo.cured + info.cured;
      chinaInfo.dead = chinaInfo.dead + info.dead;
      const provinceInfo: CityCacheModel = {
        name: info.provinceName,
        shortName: info.provinceShortName,
        confirmed: info.confirmed,
        suspected: info.suspected,
        cured: info.cured,
        dead: info.dead,
      }
      const provinceKey = `province-${info.provinceName.substr(0, 2)}`
      const oldProvince = this.cache.get<CityCacheModel>(provinceKey);
      if (!oldProvince || !this.isEqual(oldProvince, provinceInfo)) {
        if (oldProvince) {
          newCityInfos[info.provinceName] = provinceInfo;
        }
        this.cache.set<CityCacheModel>(provinceKey, provinceInfo);
      }

      info.cities.map(city => {
        const cityKey = `city-${city.cityName.substr(0, 2)}`;
        const cityInfo: CityCacheModel = {
          name: city.cityName,
          shortName: '',
          confirmed: city.confirmed,
          suspected: city.suspected,
          cured: city.cured,
          dead: city.dead,
        }
        const oldCity = this.cache.get<CityCacheModel>(cityKey);
        if (!oldCity || !this.isEqual(oldCity, cityInfo)) {
          if (oldCity) {
            newCityInfos[city.cityName] = cityInfo;
          }
          this.cache.set<CityCacheModel>(cityKey, cityInfo);
        }
      });
    });
    await InfoSubscribe.mass(newCityInfos);
    this.cache.set<CityCacheModel>('中国', chinaInfo);
  }

  public static getSubscription (city: string, type: string) {
    const key = `subscripte-${type}-${city}`
    return this.cache.get<{[id: string]: string}>(key);
  }
  public static async setSubscription (city: string, info:{[id: string]: string}, type: string) {
    const key = `subscripte-${type}-${city}`;
    this.cache.set<{[id: string]: string}>(key, info);
    const subscripteKey = 'subscripte';
    let allCityInfo = this.cache.get<FileSubscripteModel>(subscripteKey);
    if (!allCityInfo) {
      allCityInfo = {
        contact: {},
        room: {}
      };
    }
    allCityInfo[type][city] = Object.keys(info) || [];
    this.cache.set<FileSubscripteModel>(subscripteKey, allCityInfo);
    FileOperate.write('cityInfo', JSON.stringify(allCityInfo));
  }
  public static async delSubscription (city: string, info:{[id: string]: string}, type: string) {
    const key = `subscripte-${type}-${city}`;
    this.cache.del(key);
    const subscripteKey = 'subscripte';
    let allCityInfo = this.cache.get<FileSubscripteModel>(subscripteKey);
    if (!allCityInfo) {
      allCityInfo = {
        contact: {},
        room: {}
      };
    }
    allCityInfo[type][city] = Object.keys(info) || [];
    this.cache.set<FileSubscripteModel>(subscripteKey, allCityInfo);
    FileOperate.write('cityInfo', JSON.stringify(allCityInfo));
  }
  public static async initSubscription () {
    const subscripteKey = `subscripte`;
    const allCityInfo: FileSubscripteModel = await FileOperate.read('cityInfo');
    if (!allCityInfo) {
      return;
    }

    this.cache.set<FileSubscripteModel>(subscripteKey, allCityInfo);
    const contactCityList = Object.keys(allCityInfo.contact);
    contactCityList.map(city => {
      const key = `subscripte-contact-${city}`;
      const list:{[id: string]: string} = {};
      allCityInfo.contact[city].map(id => {
        list[id] = id;
      });
      this.cache.set<{[id: string]: string}>(key, list);
    });

    const roomCityList = Object.keys(allCityInfo.room);
    roomCityList.map(city => {
      const key = `subscripte-room-${city}`;
      const list:{[id: string]: string} = {};
      allCityInfo.room[city].map(id => {
        list[id] = id;
      });
      this.cache.set<{[id: string]: string}>(key, list);
    });
  }

  public static requestEpidemicInfo () {
    request({
      url: epidemicUrl,
    }, (
      err: Error,
      res: any,
      body: any,
    ) => {
      if (err) {
        console.error('request info ERROR:', `error info is ${err.message}`)
      } else {
        if (res.statusCode === 200) {
          const jsonStr = JSON.parse(body);
          const list = jsonStr.data.listByArea;
          this.initCity(list);
          console.info(`request info success`);
        }
      }
    });
  }

  // public static requestSearcchInfo () {
  //   request({
  //     url: searchUrl,
  //   }, (
  //     err: Error,
  //     res: any,
  //     body: any,
  //   ) => {
  //     if (err) {
  //       console.error('request info ERROR:', `error info is ${err.message}`)
  //     } else {
  //       if (res.statusCode === 200) {
  //         const jsonStr = JSON.parse(body);
  //         const list = jsonStr.data.listByArea;
  //         this.initCity(list);
  //         console.info(`request info success`);
  //       }
  //     }
  //   });
  // }

  public static isEqual (oldInfo: CityCacheModel, newInfo: CityCacheModel) {
    const keys = Object.keys(newInfo);
    for (const key of keys) {
      if (oldInfo[key] !== newInfo[key]) {
        return false;
      }
    }

    return true;
  }
}