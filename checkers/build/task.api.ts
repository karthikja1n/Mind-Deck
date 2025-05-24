import * as js from 'json-server'
import { resolve } from 'path';
import { Application, Router } from 'express'
import * as Chance from 'chance';

const chance = new Chance()
const server = (cb?: any) => {
    const PORT     = 34564
    const HOSTNAME = 'localhost'

    const app: Application = js.create()
    const router: Router   = js.router(resolve(__dirname, 'api.db.json'));
    const middlewares      = js.defaults();

    app.use(middlewares);
    app.use(js.bodyParser)
    app.use((req, res, next) => {
        if ( req.method === 'POST' ) req.body.createdAt = Date.now()
        next()
    })

    let { data } = require('./mocks/update-api-db-json');

    data.forEach(mock => {
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

