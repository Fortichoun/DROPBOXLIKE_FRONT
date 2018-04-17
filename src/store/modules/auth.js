/* eslint-disable promise/param-names */
import { AUTH_REQUEST, REGISTER_REQUEST, AUTH_ERROR, AUTH_SUCCESS, AUTH_LOGOUT, GETUSER_REQUEST, USER_ERROR, USER_SUCCESS } from '../actions/auth'
import axios from 'axios';

const state = {
  token: localStorage.getItem('user-token') || '',
  status: '',
  hasLoadedOnce: false,
  user: '',
};

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  getProfile: state => state.user,
  isProfileLoaded: state => !!state.user,
};

const actions = {
  [AUTH_REQUEST]: ({commit, dispatch}, user) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST);
      axios.post('http://localhost:9005/api/auth/login',
        {email: user.loginEmail, password: user.loginPassword}
      )
        .then(resp => {
          localStorage.setItem('user-token', resp.data.token);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token;
          commit(AUTH_SUCCESS, resp);
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('user-token');
          reject(err)
        })
    })
  },
  [REGISTER_REQUEST]: ({commit}, user) => {
    return new Promise((resolve, reject) => {
      commit(REGISTER_REQUEST);
      axios.post('http://localhost:9005/api/auth/register',
        user
      )
        .then(resp => {
          localStorage.setItem('user-token', resp.data.token);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token;
          commit(AUTH_SUCCESS, resp);
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('user-token');
          reject(err)
        })
    })
  },
  [AUTH_LOGOUT]: ({commit}) => {
    return new Promise((resolve) => {
      commit(AUTH_LOGOUT);
      localStorage.removeItem('user-token');
      resolve()
    })
  },
  [GETUSER_REQUEST]: ({commit, dispatch}) => {
    return new Promise((resolve, reject) => {
      commit(GETUSER_REQUEST);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token;
      axios.get('http://localhost:9005/api/users/me')
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
};

const mutations = {
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.token = resp.data.token;
    state.user = resp.data.user;
    state.hasLoadedOnce = true
  },
  [AUTH_ERROR]: (state) => {
    state.status = 'error';
    state.hasLoadedOnce = true
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = '';
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
};

export default {
  state,
  getters,
  actions,
  mutations,
}
