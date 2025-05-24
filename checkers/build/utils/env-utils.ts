import config from '../config';
import { getRandomId } from '@radic/util';
import { EnvUtils } from '../interfaces';


export default (set?:'development'|'production'|'testing'): EnvUtils => {
    if(set){
        process.env.NODE_ENV = set;
    }
    let dev           = process.env.NODE_ENV === 'development';
    let prod          = ! dev;
    let name          = process.env.NODE_ENV;
    let env: EnvUtils = {
        dev,
        prod,
        name,
        fileHash: getRandomId(7),
        config  : config[ prod ? 'prod' : 'dev' ]
    }

    return env
}
