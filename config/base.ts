import { ShimoStatus } from "../config/enum";

// token
export const token: string = 'your-token';

// name
export const name: string = 'your-botName';

// url
export const epidemicUrl: string = 'https://service-f9fjwngp-1252021671.bj.apigw.tencentcs.com/release/pneumonia';
export const searchUrl: string = 'http://2019ncov.nosugartech.com/data.json';

// shimo
class Shimo {

    clientId: string;
    clientSecret: string;
    url: string;
    userName: string;
    status; // TODO 这里应该声明什么类型啊？

    constructor(clientId: string = '', clientSecret: string = '', url: string = '', userName: string = '', status = ShimoStatus.Prepare) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.url = url;
        this.userName = userName;
        this.status = status;
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

    public setUrl (url: string) {
        this.url = url;
        this.setStatus(ShimoStatus.Ready);
    }

    public setStatus (status) {
        this.status = status;
        this.setStatus(ShimoStatus.Init);
    }
}

export const shimo = new Shimo();
