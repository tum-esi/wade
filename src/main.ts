import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';

Vue.config.productionTip = false;
// Global event bus
Vue.prototype.$eventHub = new Vue();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
