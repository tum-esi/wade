<template>
    <div id="table-container">
        <aListSimple class="column" v-for="(column, index) in this.table.columns" :key="index" :list="column">
            <template v-slot:header>
                <!-- Insert HTML here to customize the headers of the table -->
            </template>
            <template v-slot:rows>
                <!-- Insert HTML here to customize the rows of the table -->
            </template>
        </aListSimple>
    </div>
</template>

<script lang="ts">
/**
 * A simple table table component that is customizable using slots. 
 * To introduce a new table component, just copy this code and use the header and row slots provided in aListSimple component
 * For information on using slots, please refer to https://vuejs.org/v2/guide/components-slots.html
 */
import Vue from 'vue'; 
import aListSimple from '@/components/01_atoms/aListSimple.vue';
export default Vue.extend({
    name: 'mTableSimple',
    components : {
        aListSimple
    },
    props: {
        /**
         * Table elements
         */
        table: {
            type: Object as () => WADE.TableInterface,
            required: true
        }
    }
});
</script>

<style scoped>
#table-container {
    display: flex;
    align-content: flex-start;
    justify-content: flex-start;
    flex-flow: row nowrap;
    overflow: scroll;
}
.column {
    flex-grow: 1;
    border-radius: 0 !important;
    border-right: 0.3pt solid #393B3A !important;
    border-left: 0.3pt solid #393B3A !important;
}

.column:first-of-type {
    border-top-left-radius: 3pt !important;
    border-bottom-left-radius: 3pt !important;
    border-left: 0.5pt solid #393B3A !important;
}

.column:last-of-type {
    border-top-right-radius: 3pt !important;
    border-bottom-right-radius: 3pt !important;
    border-right: 0.5pt solid #393B3A !important;
}

</style>