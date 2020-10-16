<template>
    <div id="template-area">
        <img :src="getImg" :alt="this.title">
        <div id="description-area">
            <h4>{{this.title}}</h4>
            <p>
                <slot name="desription"></slot>
            </p>
        </div>
        <div id="selection-area">
                <input type="checkbox" :checked="isChecked" @input="$emit('input', $event.target.checked)">
                <label> Use this template </label>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    name: 'aTemplateSelectionMaGe',
    model: {
        prop: 'is-checked',
        event: 'input'
    },
    props: {
        /**
         * Source for template image. Required
         */
        imgSrc: {
            type: String,
            required: true
        },
        /**
         * Template title. Required
         */
        title: {
            type: String,
            required: true
        },
        /**
         * Checked status. Used for v-model
         */
        isChecked: Boolean
        
    },
    computed: {
        getImg(): any {
            return require(`@/assets/${this.imgSrc}.png`);
        }
    }
})
</script>

<style lang="less" scoped>
    #template-area {
        height: 100%;
        border: 0.5pt solid #393B3A;
        border-radius: 3pt; 
        background-color: white;
        display: flex;
        flex-flow: column nowrap;
    }

    #template-area img {
        object-fit: contain;
        max-width: 100%;
        height: 50%;
        margin: 2% 5%;
        flex-grow: 1;
    }

    #description-area {
        background-color: #939c9e;
        padding: 5pt;
        flex-grow: 1;
    }

    #selection-area {
        background-color: #b5dfdd;
        padding: 5pt;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }
</style>