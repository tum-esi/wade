<template>
    <div id="table-container">
        <aListSimple class="column" v-for="(tableColumn, columnIndex) in this.table.columns" :key="columnIndex" :list="tableColumn" v-show="showColumn(tableColumn)">
            <template v-slot:header>
                <div class="flex-container-row table-header">
                    <label class="margin-right-auto">{{tableColumn.header}}</label>
                </div>
            </template>
            <template v-slot:rows>
                <div
                class="element" 
                v-for="(item, rowIndex) in tableColumn.items" :key="rowIndex">
                    <label class="io-label margin-right-auto">{{item.label}}</label>
                    <div>
                        <input 
                        type="radio" 
                        :name="`${item.label}-${tableColumn.header}`" 
                        :checked="item.payload.restriction=='none'"
                        @input="setAnnotationRestriction({annotation: item.payload, restriction: 'none'})">
                        <label>No restrictions</label> 
                    </div>
                    <div>
                        <input 
                        type="radio" 
                        :name="`${item.label}-${tableColumn.header}`"
                        :checked="item.payload.restriction=='forbidden'"
                        @input="setAnnotationRestriction({annotation: item.payload, restriction: 'forbidden'})">
                        <label>Forbidden</label> 
                    </div>
                    <div>
                        <input 
                        type="radio" 
                        :name="`${item.label}-${tableColumn.header}`"
                        :checked="item.payload.restriction=='mustHave'"
                        @input="setAnnotationRestriction({annotation: item.payload, restriction: 'mustHave'})">
                        <label>Must have</label> 
                    </div>
                    
                </div>
            </template>
        </aListSimple>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'; 
import aListSimple from '@/components/01_atoms/aListSimple.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIcon from '@/components/01_atoms/aIcon.vue';
import { TD, Mashup } from '@/lib/classes';
import { mapGetters, mapMutations } from 'vuex';
export default Vue.extend({
    name: 'mAnnotationSelectionMaGe',
    components : {
        aListSimple,
        aDropdownButton,
        aIcon
    },
    props: {
        /**
         * Table elements
         */
        table: {
            type: Object as () => WADE.TableInterface,
            required: true
        },
        filters: {
            type: Object as () => MAGE.FiltersInterface,
            required: true
        },
        templates: {
            type: Object as () => {
            "use-event-template": Boolean,
            "use-action-template": Boolean,
            "use-sub-template": Boolean,
            },
            required: true
        }
    },
    methods: {
        ...mapMutations('MashupStore',['setAnnotationRestriction']),
        showColumn(column: WADE.ListInterface): boolean {
            let result: boolean = true;
            if(column.items.length === 0) return false;
            if(column.header === "PropertyReads" && this.templates["use-read-template"] === false) return false;
            if(column.header === "EventSubs" && this.templates["use-event-template"] === false) return false;
            if(column.header === "ActionReads" && this.templates["use-action-template"] === false) return false;
            if(column.header === "ActionInvokes" && !this.filters.acceptedOutputInteractionTypes.includes("action-invoke")) return false;
            if(column.header === "PropertyWrites" && !this.filters.acceptedOutputInteractionTypes.includes("property-write")) return false;
            
            return true;
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
    height: 33.8%;
}

.add-icon {
    width: 20%;
    height: 100%;
}

.column {
    flex-grow: 1;
    border-radius: 0 !important;
    border-right: 0.3pt solid #393B3A !important;
    border-left: 0.3pt solid #393B3A !important;
}

.column:first-of-type {
    border-left: 0 !important;
}

.column:last-of-type {
    border-right: 0 !important;
}

.element {
    width: 100%;
    border-bottom: 0.5pt solid #393B3A;
}

.io-element:hover {
    background: #393B3A;
    color: white;
    box-shadow: 0 6px 3px rgba(0, 0, 0, 0.19);
}

.io-remove-icon {
    height: 25%;
    margin-right: 3%;
    width: 10%;
    align-self: center;
}

.io-label {
    height: fit-content;
    max-height: 100%;
    align-self: center;
    margin-left: 3%;
}

.table-header {
    height: 100%;
    width: 100%;
    align-items: center;
}

.flex-container-row {
    display: flex;
    flex-flow: row wrap;
}

.margin-right-auto {
    margin-right: auto;
}


</style>