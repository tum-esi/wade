<template>
  <div class="td-page-container">
    <mTabbar :tabbarElements="getTdTabbar" v-on:tab-clicked="tabClicked" />
    <div v-if="currentTabId === 'config'" class="td-config">
      <oConfig class="td-config-child-el"/>
      <!-- <oProtocolSelection class="td-config-child-el" /> -->
    </div>
    <div v-if="currentTabId === 'editor'" class="td-editor">
      <aStatusbar class="td-page-statusbar" :statusMessage="statusMessage" /> <!-- TODO no property statusMessage exists on aStatusbar! can be removed? -->
      <div class="td-main">
        <div class="td-main-left border-right">
          <mUrlBar
            v-if="showUrlBar"
            class="url-bar"
            :button="fetchButton"
            :buttonAction="fetchFunction"
            v-on:btn-clicked="hideUrlBar"
            v-on:cancel-btn-clicked="hideUrlBar"
          />
          <div :class="showUrlBar ? 'editor-showUrlBar' : 'editor-full'">
            <oEditor
              v-on:hide-url-bar="hideUrlBar"
              v-on:open-config="tabClicked('config')"
            />
          </div>
        </div>
        <div class="td-main-middle border-right">
          <oSelection />
        </div>
        <div class="td-main-right">
          <oResults />
        </div>
      </div>
    </div>
    <div v-if="currentTabId === 'virtual'" class="td-virtual">
      <oVirtual/>
      <oVirtualThing/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import aStatusbar from '@/components/01_atoms/aStatusbar.vue';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import mUrlBar from '@/components/02_molecules/mUrlBar.vue';
import oConfig from '@/components/03_organisms/oConfig.vue';
import oEditor from '@/components/03_organisms/oEditor.vue';
import oVirtual from '@/components/03_organisms/oVirtual.vue';
import oVirtualThing from '@/components/03_organisms/oVirtualThing.vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oResults from '@/components/03_organisms/oResults.vue';
import oProtocolSelection from '@/components/03_organisms/oProtocolSelection.vue';
import { Url } from 'url';
import { TdStateEnum } from '../../util/enums';
import { ftruncate } from 'fs';

export default Vue.extend({
  name: 'tThingDescription',
  components: {
    aStatusbar,
    oConfig,
    oProtocolSelection,
    oEditor,
    oVirtual,
    oVirtualThing,
    oSelection,
    oResults,
    mTabbar,
    mUrlBar
  },
  created() {
    this.$eventHub.$on('dropdown-clicked', this.tabClicked);
    this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
  },
  beforeDestroy() {
    this.$eventHub.$off('dropdown-clicked');
  },
  data() {
    return {
      tdId: '',
      currentTabId: 'editor',
      statusMessage: '',
      showUrlBar: false,
      fetchButton: {
        btnLabel: 'Fetch Td',
        btnClass: 'btn-url-bar',
        btnOnClick: 'btn-clicked'
      },
      async fetchFunction(url: string) {
        // TODO: Error Handling connection time out
        let td: null | string = null;
        let errorMsg: null | string = null;
        let tdState: null | TdStateEnum = null;
        const fetchedTd = await fetch(url)
          .then(response => {
            return response.json();
          })
          .then(myJson => {
            td = JSON.stringify(myJson);
            tdState = TdStateEnum.VALID_TD_FETCHED;
            return {
              td,
              tdState,
              errorMsg
            };
          })
          .catch(err => {
            errorMsg = err;
            tdState = TdStateEnum.INVALID_TD_FETCHED;
            td = null;
            return {
              td,
              tdState,
              errorMsg
            };
          });
        (this as any).$eventHub.$emit('fetched-td', fetchedTd);
      }
    };
  },
  computed: {
    ...mapGetters('TdStore', ['getTdTabbar']),
    id() {
      return (this as any).$route.params.id;
    }
  },
  methods: {
    hideUrlBar() {
      if (this.showUrlBar) this.showUrlBar = false;
    },
    tabClicked(args: any) {
      if (args.btnValue === 'td-url') {
        this.showUrlBar = true;
      }
      if (typeof args === 'string') this.currentTabId = args;
      // this.$router.push({
      //   name: 'config',
      //   params: { type: 'td', id: this.id, tab: 'config' }
      // });
    }
  },
  watch: {
    // Check if router id changed and change active sidebar element
    '$route.params.id'(id) {
      this.$store.commit('SidebarStore/setActiveElement', id);
      this.tdId = id;
    }
  }
});
</script>

<style scoped>
.td-page-container {
  display: flex;
  flex-direction: column;
}

.td-editor {
  height: 90%;
}

.td-config {
  height: 90%;
  width: 100%;
  display: flex;
}

.td-virtual {
  height: 80%;
  width: 100%;
  display: flex;
}

.td-config-child-el {
  width: 50%;
  height: 100%;
}

.td-main {
  display: flex;
  height: 90%;
}

.td-main-left {
  width: 33%;
  padding: 0px 7px 7px 7px;
  height: 100%;
}

.td-main-middle {
  width: 33%;
  padding: 0px 7px 7px 7px;
}

.td-main-right {
  width: 33%;
  padding: 0px 7px 7px 7px;
}

.url-bar {
  width: 100%;
  height: 10%;
}

.editor-full {
  height: 100%;
}

.editor-showUrlBar {
  height: 90%;
}
</style>
