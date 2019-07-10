<template>
  <div class="home-container">
    <label>Add a new Folder, Thing Description or Mashup by clicking on the button.</label>

    <aDropdownButton
      class="dropdown-btn"
      :btnKey="getAddNewButton.btnKey"
      :btnSrc="getAddNewButton.btnSrc"
      :btnDropdownOptions="getAddNewButton.btnDropdownOptions"
      v-on:dropdown-clicked="openModuleAddElement"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';

export default Vue.extend({
    name: 'tHomePage',
    components: {
        aDropdownButton
    },
    computed: {
        ...mapGetters('SidebarStore', ['getAddNewButton']),
    },
    methods: {
      openModuleAddElement(element: any) {
        this.$emit('open-module-element', element);
    }
  }
});
</script>

<style scoped>
.home-container {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
}
.dropdown-btn {
    width: 60px;
    height: 45px;
}
</style>
