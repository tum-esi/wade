<template>
    <div id="table-container">
        <aListSimple class="column" v-for="(tableColumn, columnIndex) in this.table.columns" :key="columnIndex" :list="tableColumn">
            <template v-slot:header>
                <div class="flex-container-row table-header">
                <label class="margin-right-auto">{{tableColumn.header}}</label>
                <aDropdownButton
                    class="add-icon"
                    :class="'select-mashup-dropdown-btn'"
                    :btnKey="'add-to-'+getAddBtnKey(tableColumn.header)"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getDropDownMenu(tableColumn.header) ? getDropDownMenu(tableColumn.header) : []"
                    @dropdown-clicked="onAddInteractionSelected"
                />
            </div>
            </template>
            <template v-slot:rows>
                <div class=" flex-container-row io-element" v-for="(id, rowIndex) in tableColumn.items" :key="rowIndex">
                    <label class="io-label margin-right-auto">{{id}}</label>
                    <aIcon
                    class="io-remove-icon"
                    :specificStyle="'mage-minus-icon'"
                    :iconSrcPath="'minus'"
                    :mouseOverIconSrcPath="'minus_white'"
                    :iconClickAction="'removeInteraction'"
                    @icon-clicked="deleteFromFrobiddenInteractions(id, columnIndex)"
                    />
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
    name: 'mInteractionSelectionMaGe',
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
        }
    },
    computed: {
        ...mapGetters('MashupStore',['getPropertyReads','getPropertyWrites','getEventSubs','getActionInvokes']),
        propertyReadsDropdownMenu(){
            let propertyReads = (this as any).getPropertyReads;
            let dropdown: any[] = [];
            for(let prop of propertyReads) {
                let title = `${prop.title}: ${prop.name}`;
                let key = `${prop.thingId}/${prop.title}/${prop.name}/${prop.type}`
                dropdown.push({title: title, key: key});
            }
            return dropdown;
        },
        propertyWritesDropdownMenu(){
            let propertyWrites = (this as any).getPropertyWrites;
            let dropdown: any[] = [];
            for(let prop of propertyWrites) {
                let title = `${prop.title}: ${prop.name}`;
                let key = `${prop.thingId}/${prop.title}/${prop.name}/${prop.type}`
                dropdown.push({title: title, key: key});
            }
            return dropdown;
        },
        eventsDropdownMenu(){
            let eventSubs = (this as any).getEventSubs;
            let dropdown: any[] = [];
            for(let event of eventSubs) {
                let title = `${event.title}: ${event.name}`;
                let key = `${event.thingId}/${event.title}/${event.name}/${event.type}`
                dropdown.push({title: title, key: key});
            }
            return dropdown;
        },
        actionsDropdownMenu(){
            let actionInvokes = (this as any).getActionInvokes;
            let dropdown: any[] = [];
            for(let action of actionInvokes) {
                let title = `${action.title}: ${action.name}`;
                let key = `${action.thingId}/${action.title}/${action.name}/${action.type}`
                dropdown.push({title: title, key: key});
            }
            return dropdown;
        },
    },
    methods: {
        ...mapMutations('MashupStore',['addToForbiddenInteractions', 'removeFromForbiddenInteractions']),
        getAddBtnKey(header: string){
            let headerlow = header.toLowerCase();
            switch(headerlow) {
                case "propertyreads": return "property-reads";
                case "propertywrites": return "property-writes";
                case "eventsubs": return "event-subs";
                case "actioninvokes": return "action-invokes"
            }
        },
        getDropDownMenu(header: string){
            let headerlow = header.toLowerCase();
            switch(headerlow) {
                case "propertyreads": return this.propertyReadsDropdownMenu;
                case "propertywrites": return this.propertyWritesDropdownMenu;
                case "eventsubs": return this.eventsDropdownMenu;
                case "actioninvokes": return this.actionsDropdownMenu;
            }
        },
        deleteFromFrobiddenInteractions(id: string, columnIndex: number) {
            let substr = id.replace(/\s+/g, '').split(':');
            switch(columnIndex) {
                case 0:
                    let intr1 = {title: substr[0], name: substr[1], type: "property-read"};
                    (this as any).removeFromForbiddenInteractions(intr1);
                    break;
                case 1:
                    let intr2 = {title: substr[0], name: substr[1], type: "property-write"};
                    (this as any).removeFromForbiddenInteractions(intr2);
                    break;
                case 2:
                    let intr3 = {title: substr[0], name: substr[1], type: "event-subscribe"};
                    (this as any).removeFromForbiddenInteractions(intr3);
                    break;
                case 3:
                    let intr4 = {title: substr[0], name: substr[1], type: "action-invoke"};
                    (this as any).removeFromForbiddenInteractions(intr4);
                    break;
                default: return;
            }
        },
        onAddInteractionSelected(event) {
            let filters = this.filters;
            let substr = (event.btnValue as string).split("/");
            let interaction = {
                thingId: substr[0],
                title: substr[1],
                name: substr[2],
                type: substr[3]
            };
            (this as any).addToForbiddenInteractions(interaction);
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
    height: 50%;
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
    border-top-left-radius: 3pt !important;
    border-bottom-left-radius: 3pt !important;
    border-left: 0.5pt solid #393B3A !important;
}

.column:last-of-type {
    border-top-right-radius: 3pt !important;
    border-bottom-right-radius: 3pt !important;
    border-right: 0.5pt solid #393B3A !important;
}

.io-element {
    height: 30pt;
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