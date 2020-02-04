import { generate } from 'qrcode-terminal';
import { Wechaty, log } from 'wechaty';
import { PuppetPadplus } from 'wechaty-puppet-padplus';
import { name, token } from './config/base';
import { messageListener } from './listener/messageListener';
import { friendshipListener } from './listener/friendship';
import express = require('express');
import bodyParser = require('body-parser');
import { Schedule } from './tools/scheduleTool';
import { CacheTools } from './tools/cacheTool';

const puppet = new PuppetPadplus({
  token,
});

export const bot = new Wechaty({
  puppet,
  name,
});

bot
  .on('scan', (qrcode, status) => {
    if (status === 0) {
      generate(qrcode, {
        small: true
      })
    } else if (status === -2007) {
      generate(qrcode, {
        small: true
      })
    }
  })
  .on('login', function(){})
  .on('message', messageListener)
  .on('friendship', friendshipListener)
  .start();

export const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const listener = app.listen(0, async () => {
  let address = listener.address();
  if (typeof address !== 'string') {
    address = JSON.stringify(address);
  }
  log.info(`Listening on address ${address}`);
})

Schedule.minStart();
CacheTools.initSubscription();
// CacheTools.requestInfo();