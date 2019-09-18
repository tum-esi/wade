<template>
  <div class="tab-container" 
    :class="tabStyle"
    v-on:click="$emit('tab-clicked', tabId)">

      <aIconButton 
        v-if="tabIconButton" 
        :class="tabButtonStyle" 
        :iconBtnSrcPath="tabIconButton.iconBtnSrcPath"
        :iconBtnOnClick="tabIconButton.iconBtnOnClick"
        v-on:click="$emit('tab-btn-clicked', tabIconButton.iconBtnOnClick)"
        />
      <aDropdownButton 
        v-else-if="tabDropdownButton"
        :class="tabButtonStyle" 
        :btnLabel="tabDropdownButton.btnLabel"
        :btnKey="tabDropdownButton.btnKey"
        :btnSrc="tabDropdownButton.btnSrc"
        :btnDropdownOptions="tabDropdownButton.btnDropdownOptions"
        />
      <label 
        v-if="tabTitle" 
        class="tab-label" 
        v-on:click="$emit('tab-label-clicked', tabId)">
          {{ tabTitle }}
      </label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';

export default Vue.extend({
  name: 'aTab',
  components: {
    aIconButton,
    aDropdownButton
  },
  props: {
    /**
     * To reference tab when clicked.
     */
    tabId: {
      type: String,
      required: true
    },
    /**
     * Label for tab.
     */
    tabTitle: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * When tab needs special styling.
     */
    tabStyle: {
        type: String,
        required: false,
        default: ''
    },
    /**
     * When tab should display a icon button.
     */
    tabIconButton: {
      type: Object as () => WADE.AIconButtonInterface,
      required: false,
      default: null
    },
    /**
     * When tab should display a icon button.
     */
    tabDropdownButton: {
      type: Object as () => WADE.ADropdowButtonInterface,
      required: false,
      default: null
    },
    /**
     * When button should be left or right.
     */
    tabButtonStyle: {
        type: String,
        required: false
    },
    /**
     * If tab is router link.
     */
    tabLink: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * If tab is active / should have indication to be active.
     */
    tabIsActive: {
      type: Boolean,
      required: false,
      default: false
    }
  }
});
</script>

<style scoped>
.tab-container {
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.tab-btn-left {
  order: -1;
}

.tab-btn-right {
  order: 2;
}

.tab-btn-small {
  height: 100%;
  width: 30%;
}

.tab-btn-header {
  padding: 15px 7px 15px 7px;
}

.tab-btn-header:hover {
  background: #b5dfdd;
}

.isActive {
  background: #b4bab9;
}

/* Will only be applied for tabbar-tabs */
.tab-container-in-tabbar {
  width: 15%;
  justify-content: center;
  padding: 10px 20px 10px 20px;
  border-right: 1px solid #393B3A;
  display: flex;
  height: 100%;
  align-items: center;
}

/* Will only be applied for tabbar-tabs */
.tab-container-in-tabbar:hover {
  background: #939c9e;;
}

.tab-button-container {
  height: 100%;
  width: 40%;
  display: flex;
  margin-left: 10px;
}

.tab-button {
  width: 100%;
  height: 100%;
  padding: 0 10px 0 10px;
}
</style>

