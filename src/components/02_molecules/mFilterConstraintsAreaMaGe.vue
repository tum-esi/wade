<template>
    <div class="filters-container">
        <div class="header">
            <label>Filters and Constraints</label>
        </div>
        <div class="body">
            <div>
                <h4>Allowed Types:</h4>
                <div>
                    <input type="checkbox"  
                    :checked="typeIsChecked('string')" 
                    @input="$emit('change', onTypeConstraintChanged('string', $event.target.checked))"> 
                    <label>String</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="typeIsChecked('integer')" 
                    @input="$emit('change', onTypeConstraintChanged('integer', $event.target.checked))"> 
                    <label>Integer</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="typeIsChecked('number')" 
                    @input="$emit('change', onTypeConstraintChanged('number', $event.target.checked))">
                    <label>Number</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="typeIsChecked('boolean')" 
                    @input="$emit('input', onTypeConstraintChanged('boolean', $event.target.checked))">
                    <label>Boolean</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="typeIsChecked('array')" 
                    @input="$emit('change', onTypeConstraintChanged('array', $event.target.checked))">
                    <label>Array</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="typeIsChecked('object')"
                    @input="$emit('change', onTypeConstraintChanged('object', $event.target.checked))">
                    <label>Object</label>
                </div>
            </div>
            <div>
                <h4>Interaction Matching Criteria</h4>
                <div>
                    <input type="checkbox"
                    :checked="filters.onlySameType"
                    @input="$emit('change', onCheckBoxChecked('onlySameType',$event.target.checked))">
                    <label>Only match interactions that have similar types</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Only match interactions that have similar names</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="filters.semanticMatch"
                    @input="$emit('change', onCheckBoxChecked('semanticMatch', $event.target.checked))">
                    <label>Only match interactions that have the same semantic ("@type") context.</label>
                </div>
            </div>
        </div>
        <h4>Forbidden Interactions</h4>
        <mInteractionSelectionMaGe :table="forbiddenInteractionsTable" :filters="filters"/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import mInteractionSelectionMaGe from '@/components/02_molecules/mInteractionSelectionMaGe.vue';
import { mapGetters } from 'vuex';
import { watch } from 'fs';
export default Vue.extend({
    name: 'mFilterConstraintsAreaMaGe',
    model: {
        prop: "filters",
        event: "change"
    },
    props: {
        filters: {
            type: Object as () => MAGE.FiltersInterface,
            required: false
        }
    },
    components: {
        mInteractionSelectionMaGe
    },
    computed: {
        ...mapGetters('MashupStore',['getForbiddenInteractions']),
        forbiddenInteractionsTable() {
            let forbiddenInteractions = (this as any).getForbiddenInteractions;
            let table: WADE.TableInterface = {columns: []};
            let listW: WADE.ListInterface = {header: "PropertyWrites", items: []};
            let listR: WADE.ListInterface = {header: "PropertyReads", items: []};
            let listE: WADE.ListInterface = {header: "EventSubs", items: []};
            let listA: WADE.ListInterface = {header: "ActionInvokes", items: []};
            for(let interactiontype in forbiddenInteractions) {
                switch(interactiontype) {
                    case "propertyWrites":
                        let propertyWrites = forbiddenInteractions[interactiontype];
                        for(let prop of propertyWrites) {
                            listW.items.push(`${prop.title}: ${prop.name}`);
                        }
                        break;
                    case "propertyReads":
                        let propertyReads = forbiddenInteractions[interactiontype];
                        for(let prop of propertyReads) {
                            listR.items.push(`${prop.title}: ${prop.name}`);
                        }
                        break;
                    case "eventSubs":
                        let eventSubs = forbiddenInteractions[interactiontype];
                        for(let event of eventSubs) {
                            listE.items.push(`${event.title}: ${event.name}`);
                        }
                        break;
                    case "actionInvokes":
                        let actionInvokes = forbiddenInteractions[interactiontype];
                        for(let action of actionInvokes) {
                            listA.items.push(`${action.title}: ${action.name}`);
                        }
                        break;
                }
            }
            table.columns.push(listR);
            table.columns.push(listW);
            table.columns.push(listE);
            table.columns.push(listA);
            return table;
        },
    },
    methods: {
        typeIsChecked(type: MAGE.acceptedTypesEnum): boolean{
            return this.filters.acceptedTypes.includes(type);
        },
        onTypeConstraintChanged(type: MAGE.acceptedTypesEnum, checked: boolean): MAGE.FiltersInterface {
            let filters = this.filters;
            if(checked) filters.acceptedTypes.push(type); 
            else filters.acceptedTypes.splice(filters.acceptedTypes.indexOf(type), 1);
            
            return filters;
        },
        onCheckBoxChecked(prop: string, checked: boolean): MAGE.FiltersInterface {
            let filters = this.filters;
            filters[prop] = checked;
            return filters;
        }
    },
});
</script>

<style lang="less" scoped>
.filters-container {
    border: 0.5pt solid #393B3A;
    border-radius: 3pt;
}

.header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-bottom: 0.5pt solid #393B3A;
    padding: 5pt;
}

.body {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    background-color: #939C9E;
    padding: 5pt;
}


</style>