<template>
    <div id="table-container">
        <aListSimple class="column" v-for="(tableColumn, columnIndex) in this.table.columns" :key="columnIndex" :list="tableColumn">
            <template v-slot:header>
                <div class="flex-container-row table-header">
                <label class="margin-right-auto">{{tableColumn.header}}</label>
                <aDropdownButton
                    class="add-icon"
                    :class="'select-mashup-dropdown-btn'"
                    :btnKey="'add-to-'+tableColumn.header.toLowerCase()"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getMashupChildrenForDropdown ? getMashupChildrenForDropdown : []"
                    v-on:dropdown-clicked="onAddElementSelected"
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
                    :iconClickAction="'removeElement'"
                    @icon-clicked="deleteFromIO(rowIndex, columnIndex)"
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
import { mapGetters } from 'vuex';
export default Vue.extend({
    name: 'mTableMaGe',
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
        }
    },
    computed: {
        ...mapGetters('MashupStore',['getMashupChildrenForDropdown'])
    },
    methods: {
        deleteFromIO(elementIndex: number, columnIndex: number) {
            switch(columnIndex) {
                case 0: this.$store.commit('MashupStore/removeFromInputs', elementIndex); break;
                case 1: this.$store.commit('MashupStore/removeFromOutputs', elementIndex); break;
                case 2: this.$store.commit('MashupStore/removeFromIos', elementIndex); break;
                default: return;
            }
        },
        onAddElementSelected(event) {
            const children: Array<TD | Mashup> = this.$store.getters['MashupStore/getMashupChildren'];
            this.table.columns[0].header.toLowerCase
            let childNeeded;
            for (const child of children) {
                if (child.id === event.btnValue) childNeeded = child;
            }
            switch (event.btnKey) {
                case 'add-to-inputs': this.$store.commit('MashupStore/addToInputs', childNeeded); break;
                case 'add-to-outputs': this.$store.commit('MashupStore/addToOutputs', childNeeded); break;
                case 'add-to-ios': this.$store.commit('MashupStore/addToIos', childNeeded); break;
                default: return;
            }
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