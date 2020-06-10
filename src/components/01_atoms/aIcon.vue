<!-- 
Basic icon, that can be clicked. 
Similar to 'aIconButton', but more basic styling.
Can e.g. be used for logos etc..
-->
<template>
  <div class="icon-container" @click.prevent="onClickAction">
    <img :class="specificStyle" :src="getImg">
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aIcon',
    props: {
        /**
         * Path of icon source to be displayed.
         */
        iconSrcPath: {
            type: String,
            required: true
        },
        /**
         * Custom optional styling for icon.
         */
        specificStyle: {
            type: String,
            required: false
        },
        /**
         * Icon click action.
         */
        iconClickAction: {
            type: String,
            required: false
        }
    },
    computed: {
        getImg(): any {
        return require(`@/assets/${this.iconSrcPath}.png`);
        }
    },
    methods: {
        onClickAction() {
            if (this.iconClickAction) {
                this.$emit('icon-clicked', this.iconClickAction);
        }
  }
}
});
</script>

<style scoped>
.icon-container {
    height: 100%;
    border: none;
    display: flex;
    align-items: center;
}

.icon-container img {
    max-height: 100%;
    object-fit: contain;
    padding: 5px 7px 5px 7px;
}
</style>

