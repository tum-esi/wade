<template>
  <div class="sidebar-element-container" v-on:click="sidebarElementClicked">
    <div class="sidebar-elment-inner-container" :class="{ 'active': isActive }">
      <img v-if="iconSrcPath" class="sidebar-element-icon-type" :src="getIconSrcPath">
      <label class="sidbar-element-label">{{ title }}</label>
      <img
        v-if="hasTimingPerformance"
        class="sidebar-element-icon-performance"
        :src="srcPathTimingPerf"
      >
      <img v-if="hasChildren" class="sidebar-element-icon-dropdown" :src="srcPathDropdown">
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ElementTypeEnum } from '@/util/enums';
import { mapMutations, mapGetters } from 'vuex';

export default Vue.extend({
    name: 'aSidebarElement',
    props: {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    hasChildren: {
      type: Boolean,
      default: false
    },
    children: {
      type: Object as () => WADE.SidebarElement[],
      required: false
    },
    hasTimingPerformance: {
      type: Boolean,
      default: false
    },
    iconSrcPath: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
      return{
          srcPathTimingPerf: require('@/assets/performance.png'),
          srcPathDropdown: require('@/assets/arrow_down.png')
      };
  },
  computed: {
    ...mapGetters('SidebarStore', ['isActiveElement']),
    isActive(): any {
      return this.isActiveElement(this.id, this.type);
    },
    getIconSrcPath(): any {
      return require(`@/assets/${this.iconSrcPath}.png`);
    }
  },
  methods: {
    ...mapMutations('SidebarStore', ['setActiveElement']),
    sidebarElementClicked() {
      this.setActiveElement(this.id);
      this.$emit('element-clicked', this.id, this.type);
    }
  }
});
</script>

<style scoped>
.sidebar-element-container {
  border-bottom: 1px solid #393B3A;
  height: 50px;
  display: flex;
}

.sidebar-elment-inner-container {
    width: 100%;
    display: flex;
    align-items: center;
    border-left: 7px solid transparent;
    padding: 5px 5px 5px 0px;
}

.active {
  border-left: 7px solid #b5dfdc;
}

.sidebar-element-container:hover {
  background: #b4bab9;
}

.sidebar-element-icon-type {
  width: 20%;
  padding: 10px;
}

.sidbar-element-label {
  width: 65%;
}

.sidebar-element-icon-dropdown, .sidebar-element-icon-performance{
  width: 15%;
  padding: 10px;
}
</style>
