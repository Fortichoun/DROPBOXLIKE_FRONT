/* eslint-disable promise/param-names */
import { AUTH_REQUEST, REGISTER_REQUEST, AUTH_ERROR, AUTH_SUCCESS, AUTH_LOGOUT, GETUSER_REQUEST, USER_ERROR, USER_SUCCESS, CONFIRM_EMAIL_REQUEST} from '../actions/auth'
import axios from 'axios';

const backendPath = 'http://localhost';
const backendPort = '9005';

const state = {
  token: localStorage.getItem('user-token') || '',
  isUserConfirmed: localStorage.getItem('user-confirmed') || false,
  status: '',
  hasLoadedOnce: false,
  user: '',
};

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  getProfile: state => state.user,
  isProfileLoaded: state => !!state.user,
  isEmailConfirmed: state => !!state.isUserConfirmed,
};

const actions = {
  [AUTH_REQUEST]: ({commit, dispatch}, user) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST);
      axios.post(`${backendPath}:${backendPort}/api/auth/login`,
        {email: user.email, password: user.password}
      )
        .then(resp => {
          localStorage.setItem('user-token', resp.data.token);
          localStorage.setItem('user-confirmed', resp.data.user.isEmailConfirmed.toString());
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token;
          commit(AUTH_SUCCESS, resp);
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('user-token');
          localStorage.removeItem('user-confirmed');
          reject(err)
        })
    })
  },
  [REGISTER_REQUEST]: ({commit}, user) => {
    return new Promise((resolve, reject) => {
      commit(REGISTER_REQUEST);
      axios.post(`${backendPath}:${backendPort}/api/auth/register`,
        user
      )
        .then(resp => {
          localStorage.setItem('user-token', resp.data.token);
          localStorage.setItem('user-confirmed', resp.data.user.isEmailConfirmed.toString());
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token;
          commit(AUTH_SUCCESS, resp);
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('user-token');
          localStorage.removeItem('user-confirmed');
          reject(err)
        })
    })
  },
  [AUTH_LOGOUT]: ({commit}) => {
    return new Promise((resolve) => {
      commit(AUTH_LOGOUT);
      localStorage.removeItem('user-token');
      localStorage.removeItem('user-confirmed');
      resolve()
    })
  },
  [GETUSER_REQUEST]: ({commit, dispatch}) => {
    return new Promise((resolve, reject) => {
      commit(GETUSER_REQUEST);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token;
      axios.get(`${backendPath}:${backendPort}/api/users/me`)
        .then(resp => {
          commit(USER_SUCCESS, resp);
          resolve(resp)
        })
        .catch(resp => {
          commit(USER_ERROR);
          // if resp is unauthorized, logout, to
          dispatch(AUTH_LOGOUT);
          reject(resp)
        })
    })
  },
  [CONFIRM_EMAIL_REQUEST]: ({commit}, hash) => {
    return new Promise((resolve, reject) => {
      commit(CONFIRM_EMAIL_REQUEST);
      axios.post(`${backendPath}:${backendPort}/api/users/confirmEmail`,
        { hash }
      )
        .then(resp => {
          localStorage.setItem('user-token', resp.data.token);
          localStorage.setItem('user-confirmed', resp.data.user.isEmailConfirmed.toString());
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token;
          commit(AUTH_SUCCESS, resp);
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('user-token');
          localStorage.removeItem('user-confirmed');
          reject(err)
        })
    })
  },
};

const mutations = {
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.token = resp.data.token;
    state.isUserConfirmed = resp.data.user.isEmailConfirmed;
    state.user = resp.data.user;
    state.hasLoadedOnce = true
  },
  [AUTH_ERROR]: (state) => {
    state.status = 'error';
    state.hasLoadedOnce = true
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = '';
    state.isUserConfirmed = '';
    state.user = ''
  },
  [GETUSER_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [USER_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.user = resp.data
  },
  [USER_ERROR]: (state) => {
    state.status = 'error'
  },
  [CONFIRM_EMAIL_REQUEST]: (state) => {
    state.status = 'loading'
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
}
