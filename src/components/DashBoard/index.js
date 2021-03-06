import React, { Component } from 'react';
import { NavBar } from 'antd-mobile';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { getMsgList, recMsg } from '../../redux/chat.redux';

import './index.css';
import Boss from '../Boss/boss';
import Genius from '../Genius/genius';
import Msg from '../Msg';
import User from '../User';
import NavLinkBar from '../NavLinkBar';

@connect(
    state => state,
    { getMsgList, recMsg }
)
class Dashboard extends Component {
    componentDidMount() {
        if (!this.props.chat.chatmsg.length) {
            this.props.getMsgList();
            this.props.recMsg();
        }
    }

    render() {
        const user = this.props.user;
        const { pathname } = this.props.location;
        const navList = [
            {
                path: '/boss',
                text: '牛人',
                icon: 'boss',
                title: '牛人列表',
                component: Boss,
                hide: user.type === 'genius',
            },
            {
                path: '/genius',
                text: 'Boss',
                icon: 'genius',
                title: 'Boss列表',
                component: Genius,
                hide: user.type === 'boss',
            },
            {
                path: '/msg',
                text: '消息',
                icon: 'msg',
                title: '消息列表',
                component: Msg,
            },
            {
                path: '/user',
                text: '我的',
                icon: 'user',
                title: '个人中心',
                component: User,
            }
        ];
        return (
            <div>
                <header>
                    <NavBar
                        mode="dark"
                        className='fixed-header'
                    >{navList.find(v => v.path === pathname).title}</NavBar>
                </header>
                <div style={{ marginTop: 45 }}>
                    <Switch>
                        {navList.map(v => (
                            <Route key={v.path} path={v.path} exact component={v.component} />
                        ))}
                    </Switch>
                </div>

                <footer>
                    <NavLinkBar data={navList} />
                </footer>
            </div>
        )
    }
}

export default Dashboard
