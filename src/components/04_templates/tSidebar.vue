<template>
  <div class="sidebar">
    <aTab
      class="sidebar-header"
      :tabId="getHeaderTab.tabId"
      :tabTitle="getHeaderTab.tabTitle"
      :tabStyle="getHeaderTab.tabStyle"
      :tabButtonStyle="getHeaderTab.tabButtonStyle"
      :tabIconButton="getHeaderTab.tabIconButton"
      v-on:tab-clicked="homeClicked"
    />
    <div class="sidebar-content">
      <div class="sidebar-search">
        <aSearchbar class="searchbar" />
        <aDropdownButton
          class="dropdown-btn"
          :btnKey="getAddNewButton.btnKey"
          :btnSrc="getAddNewButton.btnSrc"
          :btnDropdownOptions="getAddNewButton.btnDropdownOptions"
          v-on:dropdown-clicked="openModuleAddElement"
        />
      </div>
      <div class="sidebar-elements-container">
        <mSidebarElementGroup
          v-on:element-clicked="sidebarElementClicked"
          v-on:dropdown-clicked="openModuleAddElement"
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import aTab from '@/components/01_atoms/aTab.vue';
import aSearchbar from '@/components/01_atoms/aSearchbar.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import mSidebarElementGroup from '@/components/02_molecules/mSidebarElementGroup.vue';

export default Vue.extend({
  name: 'tSidebar',
  components: {
    aTab,
    aSearchbar,
    aDropdownButton,
    mSidebarElementGroup
  },
  computed: {
    ...mapGetters('SidebarStore', [
      'getHeaderTab',
      'getAddNewButton',
      'getSidebarElements'
    ])
  },
  methods: {
    homeClicked() {
      this.$emit('home-clicked');
    },
    sidebarElementClicked(elementId: string, elementType: string) {
      this.$emit('sidebar-element-clicked', elementId, elementType);
    },
    openModuleAddElement(element: any) {
      this.$emit('open-module-element', element);
    }
  }
});
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #393b3a;
}

.sidebar-header {
  height: 10%;
  background: #b5dfdd;
}

.sidebar-content {
  height: 90%;
}

/* Contains searchbar and add-dropdown-btn */
.sidebar-search {
  display: flex;
  justify-content: space-between;
  padding: 7px;
  height: 10%;
  border-bottom: 1px solid #393b3a;
}

/* Searchbar Input field with icon */
.searchbar {
  width: 77%;
}

/* Add-dropdown btn */
.dropdown-btn {
  width: 20%;
}
</style>

