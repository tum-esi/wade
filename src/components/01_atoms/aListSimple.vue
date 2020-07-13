<template>
    <div id="list">
        <div class="header-div">
            <slot name="header">
                <label>{{list.header}}</label>
            </slot>
        </div>
        <div class="rows grey">
            <slot name="rows">
                <ul>
                    <li v-for="(item, index) in list.items" :key="index"> {{item}} </li>
                </ul>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
/**
 * A simple list component that is customizable using slots. 
 * For information on using slots, please refer to https://vuejs.org/v2/guide/components-slots.html
 */
export default Vue.extend({
    name: 'aListSimple',
    props: {
        /**
         * The header for the table. Required
         */
        list: {
            type: Object as () => WADE.ListInterface,
            required: true
        },
    }
})
</script>

<style lang="css" scoped>
    #list {
        border: 0.5pt solid #393B3A;
        width: 70pt;
        border-radius: 3pt;
    }

    .header-div {
        width: 100%;
        height: 14.5%;
        max-height: 100%;
        border-bottom: 0.5pt solid #393B3A;
        padding: 5pt;
    }

    .rows {
        height: 85.5%;
        overflow: scroll;
        border-bottom-left-radius: inherit;
    }

    .rows li {
        height: 25pt;
        max-height: 100%;
        border-bottom: 0.5pt solid #393B3A;
        background-color: #939c9e;
        padding: 3%;
        list-style-type: none;
    }

    .rows li:last-of-type {
        border: 0;
    }


</style>