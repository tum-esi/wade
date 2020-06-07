<!-- A simple element, that takes one or two inputs (strings or numbers) and has a border. 
With multiple inputs: The first is viewed on the left, the second on the right, divided by a line. -->
<template>
  <div class="option-element-container" :class="getContainerStyle">
    <label :class="getFirstElStyle">{{ firstElement }}</label>
    <label v-if="secondElement" class="width-50 option-element" :class="{ 'second' : secondElementNotCentered }">{{ secondElement }}</label>
    <img v-if="icon" :src="iconSrc">
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aOptionElement',
    props: {
        /**
         * Will be viewed on the left.
         */
        firstElement: {
            required: true
        },
        /**
         * Will be viewed on the right. Optional.
         */
        secondElement: {
            required: false
        },
        /**
         * Optional style element
         */
        elementStyle: {
            required: false
        },
        /**
         * Indicates whenever the content of the second element should not be centered.
         * E.g. when it contains more elements than space to show
         */
        secondElementNotCentered: {
            required: false
        },
        /**
         * If there should be an icon/img as second element
         */
        icon: {
            type: String,
            required: false
        }
    },
    computed: {
        /**
         * Dynamically require icon source
         */
        iconSrc(): any {
            return require(`@/assets/${this.icon}.png`);
        },
        /**
         * Get css style elements for the first element.
         * It changes when there's a second element or an icon.
         */
        getFirstElStyle(): string {
            let firstElStyle = 'full-height option-element';
            if (this.secondElement) firstElStyle = `${firstElStyle} width-50 border-right`;
            if (this.icon) firstElStyle = `${firstElStyle} width-50`;
            return firstElStyle;
        },
        /**
         * Get css style for the whole container.
         * Changes whenever there's a second element or an icon.
         */
        getContainerStyle(): string {
            let containerStyle = '';
            if (this.icon) containerStyle = `${containerStyle} container-space-between`;
            if (this.elementStyle) containerStyle = `${containerStyle} ${this.elementStyle}`;
            return containerStyle;
        }
    }
});
</script>

<style scoped>
.option-element-container {
    border: 1px solid #393B3A;
    border-radius: 3px;    
    display: flex;
    width: 100%;
    height: 35px;
    margin: 5px 0 5px 0;
}

.container-space-between {
    justify-content: space-between
}

.option-element-container img {
    max-height: 100%;
    object-fit: contain;
    max-width: 100%;
    padding: 5px;
}

.option-element-container label {
    display: flex;
    align-items: center;
    padding-left: 4px;
    overflow: scroll;
}

.option-element {
    padding: 0 3px 0 3px;
}

.second {
    align-items: flex-start !important;
}
</style>


