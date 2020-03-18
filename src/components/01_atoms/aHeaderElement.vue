<template>
    <div class="header-container">
        <img :src="iconSrc">
        <label>{{ title }}</label>
        <aButtonCancel class="cancel" v-on:cancel-btn-clicked="$emit('cancel-btn-clicked')"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aButtonCancel from '@/components/01_atoms/aButtonCancel.vue';

export default Vue.extend({
    name: 'aHeaderElement',
    components: {
        aButtonCancel
    },
    props: {
        /**
         * Title for displayed label in header.
         */
        title: {
        type: String,
        required: true
        },
        /**
         * Type of header element (folder, td or mashup).
         * Needed for according icon.
         */
        type: {
        type: String,
        required: true
        }
    },
    computed: {
        iconSrc(): any {
           return require(`@/assets/${this.type}.png`);
        }
    }
});
</script>


<style scoped>
.header-container {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  border-bottom: 1px solid #b4bab9;
  padding: 10px;
}

.header-container img {
  width: 5%;
}

.header-container label {
  width: 82%;
  padding-left: 40px;
  font-size: 20px;
  font-weight: bold;
}

.header-container .cancel {
  width: 8%;
}
</style>
