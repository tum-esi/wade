<template>
  <div class="td-page-container">
    <mTabbar :tabbarElements="getTdTabbar" v-on:tab-clicked="tabClicked" />

    <!-- Tab Config -->
    <div
      v-if="currentTabId === 'config'"
      :class="getSidebarActive ? 'td-config border-top' : 'td-config full-screen border-top'"
    >
      <oConfig class="td-config-child-el" />
      <!-- <oProtocolSelection class="td-config-child-el" /> -->
    </div>
    <!-- Tab Virtual Thing -->
    <div
      v-if="currentTabId === 'virtual'"
      :class="getSidebarActive ? 'td-virtual border-top' : 'td-virtual border-top full-screen'"
    >
      <oVirtual />
      <oVirtualThing />
    </div>
    <!-- Tab Performance -->
    <div
      v-if="currentTabId === 'performance'"
      :class="getSidebarActive ? 'td-performance border-top' : 'td-performance border-top full-screen'"
    >
      <tPerformance />
    </div>
    <!-- Tab Editor & Selection & Results (default tab) -->
    <div
      v-if="currentTabId === 'editor'"
      :class="getSidebarActive ? 'td-editor border-top' : 'td-editor border-top full-screen'"
    >
      <aStatusbar class="td-page-statusbar" :statusMessage="statusMessage" />
      <!-- TODO no property statusMessage exists on aStatusbar! can be removed? -->
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
            <oEditor v-on:hide-url-bar="hideUrlBar" v-on:open-config="tabClicked('config')" />
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
    <!-- Tab Testbench -->
    <div
      v-if="currentTabId === 'testbench'"
      :class="getSidebarActive ? 'td-testbench border-top' : 'td-testbench border-top full-screen'"
      >
      <oTestbench />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
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
import oTestbench from '@/components/03_organisms/oTestbench.vue';
import tPerformance from '@/components/04_templates/tPerformance.vue';
import { TDTabsEnum } from '../../util/enums';

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
    mUrlBar,
    tPerformance,
    oTestbench
  },
  created() {
    (this as any).changeActiveTab();
    this.$eventHub.$on('dropdown-clicked', (this as any).tabClicked);
    this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
  },
  beforeDestroy() {
    this.$eventHub.$off('dropdown-clicked');
  },
  data() {
    return {
      tdId: '',
      currentTabId: TDTabsEnum.EDITOR as TDTabsEnum | string,
      statusMessage: '',
      showUrlBar: false,
      fetchButton: {
        btnLabel: 'Fetch Td',
        btnClass: 'btn-url-bar',
        btnOnClick: 'btn-clicked'
      },
    };
  },
  computed: {
    ...mapGetters('TdStore', ['getTdTabbar']),
    ...mapGetters('SidebarStore', ['getSidebarActive']),
    id() {
      return (this as any).$route.params.id;
    }
  },
  methods: {
    ...mapMutations('TdStore', ['setActiveTab']),
    ...mapActions('TdStore',['fetchTD']),
    hideUrlBar() {
      if ((this as any).showUrlBar) (this as any).showUrlBar = false;
    },
    tabClicked(args: any | TDTabsEnum) {
      if (args.btnValue === 'td-url') {
        (this as any).showUrlBar = true;
      }
      if (typeof args === 'string') (this as any).currentTabId = args;
      // this.$router.push({
      //   name: 'config',
      //   params: { type: 'td', id: this.id, tab: 'config' }
      // });
    },
    changeActiveTab(): void {
      (this as any).setActiveTab({
        tabbarKey: 'tdTabs',
        activeTab: (this as any).currentTabId
      });
    },
    async fetchFunction(url: string) {
        (this as any).fetchTD({uri: url}).then((fetchedTd) => {
          if(fetchedTd) (this as any).$eventHub.$emit('fetched-td', fetchedTd);
        })
      }
  },
  watch: {
    // Check if router id changed and change active sidebar element
    '$route.params.id'(id) {
      this.$store.commit('SidebarStore/setActiveElement', id);
      (this as any).tdId = id;
      (this as any).currentTabId = TDTabsEnum.EDITOR;
    },
    // Change active tab if tab id changed
    'currentTabId'() {
      (this as any).changeActiveTab();
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
  height: 93%;
}

.td-config {
  height: 93%;
  width: 100%;
  display: flex;
}

.td-virtual {
  height: 100%;
  width: 100%;
  display: flex;
}

.td-config-child-el {
  width: 50%;
  height: 100%;
}

.td-main {
  display: flex;
  height: 93%;
}

.td-performance {
  height: 93%;
  width: 100%;
  display: flex;
}

.td-testbench {
  height: 100%;
  width: 100%;
  display: flex;
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
  height: 8%;
}

.editor-full {
  height: 100%;
}

.editor-showUrlBar {
  height: 92%;
}
</style>
