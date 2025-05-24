import { AxiosRequestConfig } from 'axios';

export interface IConfig {
    api: AxiosRequestConfig
    auth: {
        loginRedirect: string
        logoutRedirect: string
    },
    pusher: {
        key: string
        cluster: string
        encrypted: boolean
    }
}

const config: IConfig = {
    api   : {
        baseURL: 'http://checkers.local/api/'
    },
    auth  : {
        loginRedirect : 'home',
        logoutRedirect: 'home'
    },
    pusher: {
        key      : '5cb99248799723882f36',
        encrypted: true,
        cluster  : 'eu'
    }
}

export default config;
