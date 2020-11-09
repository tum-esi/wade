<!--
    A W-ADE header tab. 
    Non-reusable, non-dynamic component.
    If you need a dynamic tab component, please use the 'aTab.vue' component.
 --> 

 <template>
    <div 
        class="header-tab-container"
        v-on:click.self="$emit('tab-clicked', 'homeButton')"
    >
        <!-- Logo -->
        <!-- <aIcon
            class="header-tab-logo"
            v-if="!isSidebarVisible"
            :iconSrcPath="'settings'"
            :iconClickAction="'settings'"
            v-on:icon-clicked="$emit('tab-btn-clicked', 'settings')"
        /> -->
        <aIconButton
            v-if="!isSidebarVisible"
            class="header-tab-collapse-btn"
            :iconBtnSrcPath="'settings'"
            :iconBtnOnClick="'settings'"
            :iconBtnStyle="'toggle-sidebar-btn'"
            v-on:icon-btn-clicked="$emit('tab-btn-clicked', 'settings')"
        />

        <!-- Header tab title -->
        <label 
            class="header-tab-label" 
            v-on:click="$emit('tab-clicked', 'homeButton')"
        >
            W-ADE
        </label>

        <!-- Toggle sidemenu button -->
        <aIconButton
            v-if="showCollapseBtn && isSidebarVisible"
            class="header-tab-toggle-btn" 
            :iconBtnSrcPath="'arrow_double_left'"
            :iconBtnOnClick="'settings'"
            v-on:icon-btn-clicked="$emit('tab-btn-clicked', 'settings')"
        />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aIcon from '@/components/01_atoms/aIcon.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
    name: 'aTabHeader',
    components: {
        aIcon,
        aIconButton
    },
    props: {
        /**
         * Check wether sidebar is currently visible or not.
         */
        isSidebarVisible: {
            type: Boolean,
            required: true
        },
        /**
         * Check wether collapse btn should be visible.
         */
        showCollapseBtn: {
            type: Boolean,
            required: true
        },
    },
    computed: {
        ...mapGetters('SidebarStore', ['getHeaderTab'])
    }
});
</script>

<style scoped>
.header-tab-container {
    display: flex;
    align-items: center;
}

.header-tab-collapse-btn {
    height: 100%;
    background: none;
}

.header-tab-label {
    font-weight: bold;
    overflow: hidden; 
    width: 80%;
    border-right: solid 15px rgba(0, 0, 0, 0);
    padding-left: 15px;
    white-space: nowrap;
    overflow: hidden;
}

.header-tab-toggle-btn {
    height: 100%;
    width: 20%;
    padding: 10px;
    background: none;
    display: flex;
    justify-content: center;
}

/* tab-btn-right tab-btn-20 tab-btn-header */

/* tab-btn-right tab-btn-20 tab-btn-header' */



/* .tab-container {
  display: flex;
  align-items: center;
}

.tab-container label {
  overflow: hidden; */
/* } */

.tab-btn-left {
  order: -1;
}

.tab-btn-right {
  order: 2;
}

/* .tab-btn-20 {
  height: 100%;
  width: 20%;
}

.tab-btn-header {
  padding: 10px;
  background: none;
  display: flex;
  justify-content: center;
} */

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
  background: #939c9e;
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

