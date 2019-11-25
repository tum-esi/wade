<template>
  <div class="mage-container">
    <label>Now you can do Mashup Generation (MaGe) in W-ADE. woop woop</label>

    <!-- <aDropdownButton
      class="dropdown-btn"
      :btnKey="getAddNewButton.btnKey"
      :btnSrc="getAddNewButton.btnSrc"
      :btnDropdownOptions="getAddNewButton.btnDropdownOptions"
      v-on:dropdown-clicked="openModuleAddElement"
    /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
// import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';

export default Vue.extend({
    name: 'tMaGe',
  //   components: {
  //       // aDropdownButton
  //   },
    created() {
      this.setActiveElement(null);
    },
  //   computed: {
  //       ...mapGetters('SidebarStore', ['getAddNewButton']),
  //   },
     methods: {
         ...mapActions('SidebarStore', ['setActiveElement']),
  //     openModuleAddElement(element: any) {
  //       this.$eventHub.$emit('open-modal-element', element);
     }
  // }
});
</script>

<style scoped>
.mage-container {
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
