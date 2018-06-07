import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import ConfirmEmail from '@/components/ConfirmEmail'
import VueAxios from 'vue-axios'
import axios from 'axios';
import store from '../store'

Vue.use(VueAxios, axios);

Vue.use(Router);

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated && store.getters.isEmailConfirmed) {
    next();
    return
  }
  next('/')
};

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: Welcome,
    },
    {
      path: '/home/:path*',
      name: 'home',
      component: Home,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/confirmEmail/:hash',
      name: 'confirmEmail',
      component: ConfirmEmail
    }
  ]
})
