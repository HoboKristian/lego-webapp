import WebSocketClient from 'websocket.js';
import config from '../config';
import createQueryString from './createQueryString';
import { addToast } from 'app/actions/ToastActions';
import { User } from 'app/actions/ActionTypes';
import { selectCurrentUser } from 'app/reducers/auth';
import { isUserFollowing } from 'app/actions/EventActions';
import { Event } from '../actions/ActionTypes';

export default function createWebSocketMiddleware() {
  let socket = null;

  return store => {
    const makeSocket = jwt => {
      if (socket || !jwt) return;

      const qs = createQueryString({ jwt });
      socket = new WebSocketClient(`${config.wsServerUrl}/${qs}`);

      socket.onmessage = event => {
        const { type, payload, meta: socketMeta } = JSON.parse(event.data);

        const meta = {
          ...socketMeta,
          currentUser: selectCurrentUser(store.getState())
        };

        if (
          type === Event.SOCKET_REGISTRATION.SUCCESS &&
          payload.user.id === meta.currentUser.id
        ) {
          store.dispatch(isUserFollowing(meta.eventId));
        }

        store.dispatch({ type, payload, meta });
        const message = meta.successMessage || meta.errorMessage;
        if (message) {
          store.dispatch(addToast({ message }));
        }
      };

      socket.onopen = () => {
        store.dispatch({ type: 'WS_CONNECTED' });
      };

      socket.onclose = () => {
        store.dispatch({ type: 'WS_CLOSED' });
      };

      socket.onerror = () => {
        store.dispatch({ type: 'WS_ERROR' });
      };
    };

    return next => action => {
      if (action.type === 'REHYDRATED') {
        makeSocket(store.getState().auth.token);
        return next(action);
      }

      if (action.type === User.LOGIN.SUCCESS) {
        makeSocket(action.payload.token);
        return next(action);
      }

      if (action.type === User.LOGOUT) {
        if (socket) {
          socket.close();
        }

        socket = null;

        return next(action);
      }

      return next(action);
    };
  };
}
