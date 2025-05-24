import * as React from 'react';
import { observer } from 'mobx-react';
import { inject, Symbols } from '#/ioc';
import { injectable } from 'inversify';

import { RouterStore } from '#/stores';
import RootView from 'views/RootView';
import { Hot } from 'decorators';
import { PSEvents } from './PSEvents';


@Hot(module)
@observer
@injectable()
export default class App extends React.Component {
    @inject(Symbols.RouterStore) routerStore: RouterStore
    @inject(Symbols.PSEvents) psevents: PSEvents


    componentDidMount(): void {
        this.psevents.listen();
    }

    render() {
        let { route } = this.routerStore

        return (
            <RootView/>
        )
    }
}
