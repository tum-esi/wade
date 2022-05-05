import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import * as corsAnywhere from '@/backend/MaGe/corsAnywhere';

Vue.config.productionTip = false;
Vue.prototype.$eventHub = new Vue(); // Global event bus

corsAnywhere.runServer();
// Check if element of path url is available, if not navigate home
router.beforeEach((to, from, next) => {
  const pathAvailable = to.name === 'home' || to.name === 'mage' ? true : (to.name === 'thingDescription'
      || to.name === 'folder'
      || to.name === 'mashup'
      || to.name === 'config'
      || to.name === 'virtual')
      && to.params && to.params.id
      && store.getters['SidebarStore/doesIdAlreadyExist'](to.params.id);

  pathAvailable ? next() : next({name: 'home'});
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
