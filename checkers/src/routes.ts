import { Dependencies, Route, State } from '#/router';
import { Loading } from '@/Loading';
import Loadable from 'react-loadable'
import 'router5-helpers'
import UserNode from './views/nodes/UserNode';
import GameNode from './views/nodes/GameNode';
import RoomNode from './views/nodes/RoomNode';
import { Router } from 'router5/create-router';

const log = require('debug')('routes')

const componentLoader = (dynamicImport: () => Promise<any>) => Loadable({
    loader : dynamicImport,
    loading: Loading
})

const preventUnauthorized = (router: Router, dependencies: Dependencies) => (toState:State, fromState:State) => {
    log('preventUnauthorized', toState,fromState)
    return dependencies.store.auth.loggedIn;
}
const preventAuthorized   = (router: Router, dependencies: Dependencies) => (toState:State, fromState:State) => {
    log('preventAuthorized', toState,fromState)
    return dependencies.store.auth.loggedIn === false;
}

export const routes: Route[] = [
    { name: 'home', path: '/', component: componentLoader(() => import(/* webpackChunkName: "views.home" */'views/HomeView')) },
    {
        name: 'user', path: '/user', forwardTo: 'user.login', component: UserNode, children: [
            { name: 'login', path: '/login', canActivate: preventAuthorized, component: componentLoader(() => import(/* webpackChunkName: "views.user.login" */'views/LoginView')) },
            { name: 'register', path: '/register', canActivate: preventAuthorized, component: componentLoader(() => import(/* webpackChunkName: "views.user.register" */'views/RegisterView')) },
            { name: 'logout', path: '/logout', canActivate: preventUnauthorized, component: componentLoader(() => import(/* webpackChunkName: "views.user.logout" */'views/LogoutView')) }
        ]
    },
    {
        name: 'room', path: '/room', forwardTo: 'room.join', component: RoomNode, children: [
            { name: 'join', path: '/join', canActivate: preventUnauthorized, component: componentLoader(() => import(/* webpackChunkName: "views.room.join" */'views/room/JoinRoomView')) },
            { name: 'create', path: '/create', canActivate: preventUnauthorized, component: componentLoader(() => import(/* webpackChunkName: "views.room.create" */'views/room/CreateRoomView')) },
            { name: 'room', path: '/room', canActivate: preventUnauthorized, component: componentLoader(() => import(/* webpackChunkName: "views.room.room" */'views/room/RoomView')) }
        ]
    },
    {
        name: 'game', path: '/game', forwardTo: 'game.board', component: GameNode, children: [
            { name: 'board', path: '/board', canActivate: preventUnauthorized, component: componentLoader(() => import(/* webpackChunkName: "views.game.board" */'views/game/BoardView')) }
        ]
    }

]
