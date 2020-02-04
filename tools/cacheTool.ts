import NodeCache = require('node-cache');
import { cityUrl } from '../config/base';
import { CityCacheModel, InfoModel } from '../config/model';
import { InfoSubscribe } from '../manager/info/subscribe';
import { FileOperate } from './fileTool';
import request = require('request');

export class CacheTools {
  private static cache = new NodeCache({
    stdTTL: 90,
  });

  public static getCity (city: string) {
    const key = `city-${city}`
    return this.cache.get<CityCacheModel>(key);
  }
  private static async initCity (listByArea: InfoModel[]) {
    const newCityInfos:{[city: string]: CityCacheModel} = {};
    listByArea.map(info => {
      const provinceInfo: CityCacheModel = {
        name: info.provinceName,
        shortName: info.provinceShortName,
        confirmed: info.confirmed,
        suspected: info.suspected,
        cured: info.cured,
        dead: info.dead,
      }
      const provinceKey = `city-${info.provinceName}`
      const oldProvince = this.cache.get<CityCacheModel>(provinceKey);
      if (!oldProvince || !this.isEqual(oldProvince, provinceInfo)) {
        if (oldProvince) {
          newCityInfos[info.provinceName] = provinceInfo;
        }
        this.cache.set<CityCacheModel>(provinceKey, provinceInfo);
      }

      info.cities.map(city => {
        const cityKey = `city-${city.cityName}`;
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
  }

  public static getSubscription (city: string) {
    const key = `subscripte-${city}`
    return this.cache.get<{[id: string]: string}>(key);
  }
  public static async setSubscription (city: string, info:{[id: string]: string}) {
    const key = `subscripte-${city}`;
    this.cache.set<{[id: string]: string}>(key, info);
    const subscripteKey = 'subscripte';
    let allCityInfo = this.cache.get<{[city: string]: string[]}>(subscripteKey);
    if (!allCityInfo) {
      allCityInfo = {};
    }
    allCityInfo[city] = Object.keys(info) || [];
    this.cache.set<{[city: string]: string[]}>(subscripteKey, allCityInfo);
    FileOperate.write('cityInfo', JSON.stringify(allCityInfo));
  }
  public static async initSubscription () {
    const subscripteKey = `subscripte`;
    const allCityInfo: {[city: string]: string[]} = await FileOperate.read('cityInfo');
    this.cache.set<{[city: string]: string[]}>(subscripteKey, allCityInfo);
    const citylist = Object.keys(allCityInfo);
    citylist.map(city => {
      const key = `subscripte-${city}`;
      const list:{[id: string]: string} = {};
      allCityInfo[city].map(id => {
        list[id] = id;
      });
      this.cache.set<{[id: string]: string}>(key, list);
    })
  }

  public static requestInfo () {
    request({
      url: cityUrl,
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