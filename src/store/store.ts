import Vue from 'vue';
import Vuex from 'vuex';
import SidebarStore from './modules/sidebar';
import TdStore from './modules/td';
import ModalStore from './modules/modal';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    SidebarStore,
    TdStore,
    ModalStore
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
});
