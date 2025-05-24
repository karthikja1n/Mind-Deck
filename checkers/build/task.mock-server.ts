import * as js from 'json-server'
import { resolve } from 'path';
import { Application, Router } from 'express'
import * as f from 'faker'
import * as _ from 'lodash';
import { Dictionary, Revision } from '../src/logic/api';
import { FONTAWESOME_ICONS, FontAwesomeIcon, MATERIAL_COLORS, MaterialColorName } from './constants'
import * as Chance from 'chance';

const chance = new Chance()
const server = (cb?: any) => {
    const PORT     = 34564
    const HOSTNAME = 'localhost'

    const app: Application = js.create()
    const router: Router   = js.router(resolve(__dirname, 'api.db.json'));
    const middlewares      = js.defaults();

    app.use(middlewares);
// To handle POST, PUT and PATCH you need to use a body-parser
    app.use(js.bodyParser)
    app.use((req, res, next) => {
        if ( req.method === 'POST' ) req.body.createdAt = Date.now()
        next()
    })



    generators.forEach(mock => {
        app.get(`/api/v1${mock.url}`, (req, res) => {
            res.json(mock.data);
        })
    })


    app.use(router);
    let server = app.listen(PORT, HOSTNAME, () => {
        console.log('running on http://localhost:34564')
    })

    cb({ server, app })
}

export default server

export namespace generators {

    export interface Mock<T extends object = object> {
        url:string
        data:T
    }
    export const mocks:Array<Mock> = []


    mocks.push({
        url: '/',
        data: {

        }
    })


}
