<template>
  <ul class="tabbar-container">
    <li class="tabbar-elements">
      <aTab
        v-for="(tab, index) in tabbarElements"
        :key="index"
        :tabId="tab.tabId"
        :tabTitle="tab.tabTitle"
        :tabStyle="tab.tabStyle"
        :tabIconButton="tab.tabIconButton"
        :tabDropdownButton="tab.tabDropdownButton"
        :tabButtonStyle="tab.tabButtonStyle"
        :tabLink="tab.tabLink"
        :tabIsActive="tab.tabIsActive"
        v-on:tab-clicked="$emit('tab-clicked', tab.tabId)"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';
import aTab from '@/components/01_atoms/aTab.vue';

export default Vue.extend({
    name: 'mTabbar',
    components: {
        aTab
    },
    props: {
        /**
         * List of tab elments.
         */
        tabbarElements: {
        type: Array as () => WADE.TabbarElementInterface[],
        required: true
    }
  }
});
</script>


<style scoped>
.tabbar-container {
  list-style-type: none;
  display: inline-block;
  border-bottom: 1px solid #393B3A;
  width: 100%;
  height: 7%;
}
.tabbar-elements {
  height: 100%;
  display: flex;
}
</style>
