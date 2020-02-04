# Robot-WeChaty

## Notice
you need a wechaty token.

## Install
```js
npm i
```

## Run
### You need to modify the token in config/base.ts;
```js
ts-node index.ts
```

## Features
订阅地区疫情信息(当该地区消息改变时，会进行发送信息给用户)
  使用方法: 私聊机器人，发送: 订阅+地区名称
查询地区疫情信息
  使用方法: 私聊机器人，发送: 查+地区名称

## Question：
  取消订阅，未实现
  地区的匹配方式存在问题，即 订阅成都市 不会成功，订阅成都 会成功
  配置存在本地，未区分微信号