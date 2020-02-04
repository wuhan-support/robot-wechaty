export interface CityCacheModel {
  name: string,
  shortName: string,
  confirmed: number,
  suspected: number,
  cured: number,
  dead: number,
}

export interface CityModel {
  cityName: string,
  confirmed: number,
  suspected: number,
  cured: number,
  dead: number,
}

export interface InfoModel {
  provinceName: string,
  provinceShortName: string,
  confirmed: number,
  suspected: number,
  cured: number,
  dead: number,
  comment: string,
  cities: CityModel[]
}
