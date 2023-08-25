/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import classNames from 'classnames';
import { compose } from '../Utils/HOC';
import withLanguage from '../Language';
import withSnackbarNotifications from '../Notifications';
import Actions from './Actions';
import Call from './Calls/Call';
import ChatInfo from './ColumnRight/ChatInfo';
import Dialogs from './ColumnLeft/Dialogs';
import DialogDetails from './ColumnMiddle/DialogDetails';
import ForwardDialog from './Popup/ForwardDialog';
import GroupCall from './Calls/GroupCall';
import InstantViewer from './InstantView/InstantViewer';
import MediaViewer from './Viewer/MediaViewer';
import PipPlayer from './Player/PipPlayer';
import ProfileMediaViewer from './Viewer/ProfileMediaViewer';
import { highlightMessage } from '../Actions/Client';
import AppStore from '../Stores/ApplicationStore';
import CallStore from '../Stores/CallStore';
import ChatStore from '../Stores/ChatStore';
import InstantViewStore from '../Stores/InstantViewStore';
import UserStore from '../Stores/UserStore';
import PlayerStore from '../Stores/PlayerStore';
import TdLibController from '../Controllers/TdLibController';
import '../TelegramApp.css';

class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.dialogDetailsRef = React.createRef();

        const { isChatDetailsVisible, mediaViewerContent, profileMediaViewerContent, isSmallWidth } = AppStore;

        this.state = {
            isChatDetailsVisible,
            mediaViewerContent,
            profileMediaViewerContent,
            isSmallWidth,
            forwardInfo: null,
            instantViewContent: null,
            videoInfo: null,
            groupCallId: 0,
            callId: 0
        };
    }

    componentDidMount() {
        UserStore.on('clientUpdateOpenUser', this.onClientUpdateOpenUser);
        ChatStore.on('clientUpdateOpenChat', this.onClientUpdateOpenChat);

        AppStore.on('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
        AppStore.on('clientUpdateMediaViewerContent', this.onClientUpdateMediaViewerContent);
        AppStore.on('clientUpdatePageWidth', this.onClientUpdatePageWidth);
        AppStore.on('clientUpdateProfileMediaViewerContent', this.onClientUpdateProfileMediaViewerContent);
        AppStore.on('clientUpdateForward', this.onClientUpdateForward);
        CallStore.on('clientUpdateGroupCallPanel', this.onClientUpdateGroupCallPanel);
        CallStore.on('clientUpdateCallPanel', this.onClientUpdateCallPanel);
        InstantViewStore.on('clientUpdateInstantViewContent', this.onClientUpdateInstantViewContent);
        PlayerStore.on('clientUpdatePictureInPicture', this.onClientUpdatePictureInPicture);
    }

    componentWillUnmount() {
        UserStore.off('clientUpdateOpenUser', this.onClientUpdateOpenUser);
        ChatStore.off('clientUpdateOpenChat', this.onClientUpdateOpenChat);

        AppStore.off('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
        AppStore.off('clientUpdateMediaViewerContent', this.onClientUpdateMediaViewerContent);
        AppStore.off('clientUpdatePageWidth', this.onClientUpdatePageWidth);
        AppStore.off('clientUpdateProfileMediaViewerContent', this.onClientUpdateProfileMediaViewerContent);
        AppStore.off('clientUpdateForward', this.onClientUpdateForward);
        CallStore.off('clientUpdateGroupCallPanel', this.onClientUpdateGroupCallPanel);
        CallStore.off('clientUpdateCallPanel', this.onClientUpdateCallPanel);
        InstantViewStore.off('clientUpdateInstantViewContent', this.onClientUpdateInstantViewContent);
        PlayerStore.off('clientUpdatePictureInPicture', this.onClientUpdatePictureInPicture);
    }

    onClientUpdateCallPanel = update => {
        const { opened, callId } = update;

        this.setState({
            callId: opened ? callId : 0
        });
    };

    onClientUpdateGroupCallPanel = update => {
        const { opened } = update;
        const { currentGroupCall } = CallStore;

        this.setState({
            groupCallId: currentGroupCall && opened ? currentGroupCall.groupCallId : 0
        });
    };

    onClientUpdatePictureInPicture = update => {
        const { videoInfo } = update;

        this.setState({
            videoInfo
        });
    };

    onClientUpdatePageWidth = update => {
        const { isSmallWidth } = update;

        this.setState({ isSmallWidth });
    };

    onClientUpdateInstantViewContent = update => {
        const { content } = update;

        this.setState({
            instantViewContent: content
        });
    };

    onClientUpdateOpenChat = update => {
        const { chatId, messageId, popup, options } = update;

        this.handleSelectChat(chatId, messageId, popup, options || AppStore.chatSelectOptions);
    };

    onClientUpdateOpenUser = update => {
        const { userId, popup } = update;

        this.handleSelectUser(userId, popup);
    };

    onClientUpdateChatDetailsVisibility = update => {
        const { isChatDetailsVisible } = AppStore;

        this.setState({ isChatDetailsVisible });
    };

    onClientUpdateMediaViewerContent = update => {
        const { mediaViewerContent } = AppStore;

        this.setState({ mediaViewerContent });
    };

    onClientUpdateProfileMediaViewerContent = update => {
        const { profileMediaViewerContent } = AppStore;

        this.setState({ profileMediaViewerContent });
    };

    onClientUpdateForward = update => {
        const { info } = update;

        this.setState({ forwardInfo: info });
    };

    handleSelectChat = (chatId, messageId = null, popup = false, options = null) => {
        const currentChatId = AppStore.getChatId();
        const currentDialogChatId = AppStore.dialogChatId;
        const currentMessageId = AppStore.getMessageId();

        if (popup) {
            if (currentDialogChatId !== chatId) {
                TdLibController.clientUpdate({
                    '@type': 'clientUpdateDialogChatId',
                    chatId
                });
            }

            return;
        }

        if (currentChatId === chatId && messageId && currentMessageId === messageId && !options) {
            this.dialogDetailsRef.current.scrollToMessage();
            if (messageId) {
                highlightMessage(chatId, messageId);
            }
        } else if (currentChatId === chatId && !messageId && !options) {
            this.dialogDetailsRef.current.scrollToStart();
        } else {
            TdLibController.setChatId(chatId, messageId, options);
        }
    };

    handleSelectUser = async (userId, popup) => {
        if (!userId) return;

        const chat = await TdLibController.send({
            '@type': 'createPrivateChat',
            user_id: userId,
            force: true
        });

        this.handleSelectChat(chat.id, null, popup);
    };

    render() {
        const {
            instantViewContent,
            isChatDetailsVisible,
            mediaViewerContent,
            profileMediaViewerContent,
            forwardInfo,
            videoInfo,
            callId,
            groupCallId,
            isSmallWidth
        } = this.state;

        return (
            <>
                <div style={{ height: 30, backgroundColor: '#0072C6', width: '100%', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 15, color: '#fff', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className=''>
                            <img width={18} height={18} src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABsCAYAAACiuLoyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkMwQzQ2MDA4RjEzRTExRTFCMzNFQTMwMzE5REU3RjExIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkMwQzQ2MDA5RjEzRTExRTFCMzNFQTMwMzE5REU3RjExIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzBDNDYwMDZGMTNFMTFFMUIzM0VBMzAzMTlERTdGMTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzBDNDYwMDdGMTNFMTFFMUIzM0VBMzAzMTlERTdGMTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5qf500AAAGPUlEQVR42uxdOXLjRhRt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' />
                        </div>
                        <span>Outlook Web App</span>
                    </div>
                    <div className='' style={{ display: 'flex', gap: 5, alignItems: 'end', paddingRight: 15 }}>
                        <span className='owa_calendar'>
                            <span>3</span>
                        </span>
                        <span className='owa_error'>
                            <span>1</span>
                        </span>
                        <span className='owa_tab'>Почта</span>
                        <span className='owa_tab'>Календарь</span>
                        <span className='owa_tab'>Люди</span>
                        <span className='owa_tab'>Задачи</span>
                        <div style={{
                            height: 30,
                            backgroundColor: '#eaeaea',
                            display: 'flex',
                            gap: 15,
                            padding: '0px 15px'
                        }}>
                            <span className='owa_gear'></span>
                            <span className='owa_quest'></span>
                        </div>
                    </div>
                </div>
                <div
                    className={classNames('page', {
                        'page-small': isSmallWidth,
                        'page-third-column': isChatDetailsVisible
                    })}>

                    <Dialogs />
                    <DialogDetails ref={this.dialogDetailsRef} />
                    {isChatDetailsVisible && <ChatInfo />}
                </div>
                <Actions />
                {Boolean(instantViewContent) && <InstantViewer {...instantViewContent} />}
                {Boolean(mediaViewerContent) && <MediaViewer {...mediaViewerContent} />}
                {Boolean(profileMediaViewerContent) && <ProfileMediaViewer {...profileMediaViewerContent} />}
                {Boolean(forwardInfo) && <ForwardDialog {...forwardInfo} />}
                {Boolean(videoInfo) && <PipPlayer {...videoInfo} />}
                {Boolean(groupCallId) && <GroupCall groupCallId={groupCallId} />}
                {Boolean(callId) && <Call callId={callId} />}
            </>
        );
    }
}

MainPage.propTypes = {};

const enhance = compose(
    withLanguage,
    withSnackbarNotifications
);

export default enhance(MainPage);
