<!-- 
Basic icon, that can be clicked. 
Similar to 'aIconButton', but more basic styling.
Can e.g. be used for logos etc..
-->
<template>
  <div class="icon-container" 
  @click.prevent="onClickAction"
  @mouseover="mouseover=true"
  @mouseleave="mouseover=false"
   >
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
         * Path of icon source to be displayed when mouse is hovering over icon.
         */
        mouseOverIconSrcPath: {
            type: String,
            required: false
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
    data() {
        return {
            mouseover: false
        };
    },
    computed: {
        getImg(): any {
            let req = require(`@/assets/${this.iconSrcPath}.png`);
            if (this.mouseOverIconSrcPath) {
                req = this.mouseover ? require(`@/assets/${this.mouseOverIconSrcPath}.png`) :
                require(`@/assets/${this.iconSrcPath}.png`);
            }
            return req;
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
    max-width: 100%;
    object-fit: contain;
    padding: 5px 7px 5px 7px;
}

.mage-minus-icon {
    padding: 0 !important;
    height: 100% !important; 
    width: 100% !important;
    object-fit: fill;
}

.mage-icon {
    padding: 0 !important;
    object-fit: fill;
}
</style>

