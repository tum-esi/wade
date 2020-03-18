<!-- Basic footer container with an arbitrary number of buttons -->
<template>
  <div class="footer-container">
    <aBasicButton
      class="footer-container-el"
      v-for="(button, index) in buttons"
      :key="index"
      :btnClass="button.btnClass"
      :btnLabel="button.btnLabel"
      :btnOnClick="button.btnOnClick"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aBasicButton from '@/components/01_atoms/aButtonBasic.vue';

export default Vue.extend({
    name: 'aFooterElement',
    components: {
        aBasicButton
    },
    props: {
        /**
         * Array of buttons which will be displayed
         */
        buttons: {
            type: Array as () => Array<{
                btnClass: string;
                btnLabel: string;
                btnOnClick: string;
            }>
        }
    }
});
</script>

<style scoped>
.footer-container {
  height: 60px;
  width: 100%;
  display: inline-flex;
  justify-content: flex-end;
  padding: 10px 0 10px 10px;
}

.footer-container-el {
  width: 20%;
}
</style>
