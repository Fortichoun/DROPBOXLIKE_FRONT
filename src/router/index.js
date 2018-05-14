import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import ConfirmEmail from '@/components/ConfirmEmail'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios';
import store from '../store'

Vue.use(VueAxios, axios);
Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:9005/api', // Your API domain

  providers: {
    github: {
      clientId: '',
      redirectUri: 'http://localhost:8080/auth/callback' // Your client app URL
    }
  }
});

Vue.use(Router);

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated || !store.getters.isEmailConfirmed) {
    next();
    return
  }
  next('/home')
};

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
      // beforeEnter: ifNotAuthenticated
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
