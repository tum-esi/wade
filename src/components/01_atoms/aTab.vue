<template>
  <div class="tab-container" 
    :class="`${tabStyle} ${tabIsActive ? 'isActive' : ''}`"
    v-on:click.self="$emit('tab-clicked', tabId)">

      <aIconButton 
        v-if="tabIconButton && showBtn" 
        :class="tabButtonStyle" 
        :iconBtnSrcPath="tabIconButton.iconBtnSrcPath"
        :iconBtnOnClick="tabIconButton.iconBtnOnClick"
        v-on:icon-btn-clicked="$emit('tab-btn-clicked', tabIconButton.iconBtnOnClick)"
        />
      <aDropdownButton 
        v-else-if="tabDropdownButton && showBtn"
        :class="tabButtonStyle" 
        :btnLabel="tabDropdownButton.btnLabel"
        :btnKey="tabDropdownButton.btnKey"
        :btnSrc="tabDropdownButton.btnSrc"
        :btnDropdownOptions="tabDropdownButton.btnDropdownOptions"
        />
      <img class="icon" v-else-if="iconSrcPath && showIcon" :src="getImage" v-on:click="$emit('tab-clicked', tabId)">
      <label 
        v-if="tabTitle" 
        :class="tabLabelStyle" 
        v-on:click="$emit('tab-clicked', tabId)">
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
    iconSrcPath: {
      type: String,
      required: false,
      default: null
    },
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
     * When label needs specific styling.
     */
    tabLabelStyle: {
      type: String,
      required: false,
      default: 'tab-label'
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
    },
    /**
     * Can be used e.g. to indicate if the icon or dropdown btn should be shown.
     * (E.g. for hovering effects or when specific user rights are activated)
     */
    showBtn: {
      type: Boolean,
      required: false,
      default: true
    },
    showIcon: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  computed: {
    getImage() {
      return require(`@/assets/${this.iconSrcPath}.png`);
    }
  }
});
</script>

<style scoped>
.icon {
  max-width: 100%;
  max-height: 100%;
}

.tab-container {
  display: flex;
  align-items: center;
}

.tab-container label {
  overflow: hidden;
}

.tab-btn-left {
  order: -1;
}

.tab-btn-right {
  order: 2;
}

.tab-btn-20 {
  height: 100%;
  width: 20%;
}

.tab-btn-header {
  padding: 10px;
  background: none;
  display: flex;
  justify-content: center;
}

.tab-btn-header:hover {
  background: none;
}

.tab-label-80 {
  width: 80%;
  border-right: solid 15px rgba(0, 0, 0, 0);
  padding-left: 15px;
  white-space: nowrap;
  overflow: hidden;
}

.tab-label-80:hover {
  cursor: pointer;
}

.isActive {
  background: #939c9e;
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

