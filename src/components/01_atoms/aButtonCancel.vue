<!-- Small red button with an x in the middle -->

<template>
  <button class="btn btn-cancel" @click="$emit('cancel-btn-clicked')">
    <img class="btn-cancel-img" :src="btnSrc">
  </button>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aButtonCancel',
    data() {
        return {
            btnSrc: require('@/assets/cancel.png')
        };
    }
});
</script>


<style scoped>
.btn-cancel {
  border: none;
  padding: 15px;
  width: 100%;
  height: 100%;
  background: #ab7c79;
  position: relative;
}

.btn-cancel:hover {
  background: #634038;
}

.btn-cancel:focus,
.btn-cancel:active {
  outline: none;
  background: #a36a5b;
}

.btn-cancel img {
  max-width: 100%;
  height: 40%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
</style>