<!-- Basic icon button with an optional label and a click action -->
<template>
  <div class="btn-container btn" @click.prevent="onClickAction">
    <img class="btn-img" :class="iconBtnStyle" :src="getImg">
    <span v-if="iconBtnLabel"><label>{{ iconBtnLabel }}</label></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'aIconButton',
  props: {
    /**
     * Optional label below icon
     */
    iconBtnLabel: {
      type: String,
      required: false
    },
    /**
     * Path of icon source to be displayed
     */
    iconBtnSrcPath: {
        type: String,
        required: true
    },
    /**
     * Show button only when hovered
     */
    iconBtnShowOnlyOnHover: {
        type: Boolean,
        required: false,
        default: false
    },
    /**
     * Defines button action
     */
    iconBtnOnClick: {
        type: String,
        required: true
    },
    /**
     * Custom optional styling for button icon
     */
    iconBtnStyle: {
      type: String,
      required: false
    }
  },
computed: {
    getImg(): any {
      return require(`@/assets/${this.iconBtnSrcPath}.png`);
    }
},
methods: {
  onClickAction() {
      if (this.iconBtnOnClick) {
          this.$emit(this.iconBtnOnClick);
      }
  }
}
});
</script>

<style scoped>
.btn-container {
  border: none;
  display: flex;
  align-items: center;
}

.btn-img {
  max-width: 100%;
  max-height: 100%;
}

/* custom styling for mashup add btn image */
.btn-img-mashup-add {
  width: 100%;
  object-fit: contain;
  padding: 5px 7px 5px 7px;
}
</style>

