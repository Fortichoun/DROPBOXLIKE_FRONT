import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
import VModal from 'vue-js-modal'
import Icon from 'vue-awesome'
import Notifications from 'vue-notification'

Vue.use(Viewer);
Vue.use(VModal);
Vue.use(Notifications);

Vue.config.productionTip = false;

Vue.prototype.$backendPath = 'http://localhost';
Vue.prototype.$backendPort = '9005';

Vue.component('icon', Icon);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
