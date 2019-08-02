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
      <div class="sidebar-search">
        <aSearchbar 
          class="searchbar"
        />
        <aDropdownButton 
          class="dropdown-btn"
          :btnKey="getAddNewButton.btnKey"
          :btnSrc="getAddNewButton.btnSrc"
          :btnDropdownOptions="getAddNewButton.btnDropdownOptions"
          v-on:dropdown-clicked="openModuleAddElement"
        />
      </div>
    <div class="sidebar-elements-container"> 
      <aSidebarElement 
        v-for="(element, index) in getSidebarElements"
        :key="index"
        :title="element.title"
        :id="element.id"
        :type="element.type"
        :hasChildren="element.hasChildren"
        :children="element.children"
        :hasTimingPerformance="element.hasTimingPerformance"
        :iconSrcPath="element.iconSrcPath"
        v-on:element-clicked="sidebarElementClicked"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import aTab from '@/components/01_atoms/aTab.vue';
import aSearchbar from '@/components/01_atoms/aSearchbar.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aSidebarElement from '@/components/01_atoms/aSidebarElement.vue';

export default Vue.extend({
  name: 'tSidebar',
  components: {
      aTab,
      aSearchbar,
      aDropdownButton,
      aSidebarElement
  },
  computed: {
    ...mapGetters('SidebarStore', ['getHeaderTab', 'getAddNewButton', 'getSidebarElements']),
  },
  methods: {
      homeClicked() {
        this.$emit('home-clicked');
      },
      sidebarElementClicked(elementId: string, elementType: string) {
        this.$emit('sidebar-element-clicked', elementId, elementType);
        // (this as any).setActiveElement(this.id);
      },
      openModuleAddElement(element: any) {
        this.$emit('open-module-element', element);
      }
  }
});
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #393B3A;
}

.sidebar-header {
  height: 50px;
  background: #b5dfdd;
}

/* Contains searchbar and add-dropdown-btn */
.sidebar-search {
  display: flex;
  justify-content: space-between;
  padding: 7px;
  height: 50px;
  border-bottom: 1px solid #393B3A;
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

