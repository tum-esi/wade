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
                :title="item.payload.description ? item.payload.description : 'No description given'" 
                class="element" 
                v-show="showInteraction(item.payload)"
                v-for="(item, rowIndex) in tableColumn.items" :key="rowIndex">
                    <div class="label-area">
                        <label>{{item.label}}</label>
                    </div>
                    <div class="image-selector">
                        <aIcon
                        title="Mashup must not include this interaction"
                        class="selection-item-icon"
                        :class="isCheckedClass(item.payload, 'forbidden')"
                        iconSrcPath="forbidden-icon"
                        iconClickAction="checked-changed"
                        specificStyle="mage-icon"
                        @icon-clicked="setInteractionRestriction({interaction: item.payload, restriction: 'forbidden'})"/>
                        <aIcon
                        title="Mashup can include this interaction"
                        class="selection-item-icon"
                        :class="isCheckedClass(item.payload, 'none')"
                        iconSrcPath="include-icon"
                        iconClickAction="checked-changed"
                        specificStyle="mage-icon"
                        @icon-clicked="setInteractionRestriction({interaction: item.payload, restriction: 'none'})"/>
                        <aIcon
                        title="Mashup must include this interaction"
                        class="selection-item-icon"
                        :class="isCheckedClass(item.payload, 'mustHave')"
                        iconSrcPath="must-include-icon"
                        iconClickAction="checked-changed"
                        specificStyle="mage-icon"
                        @icon-clicked="setInteractionRestriction({interaction: item.payload, restriction: 'mustHave'})"/>
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
import { TD, Mashup } from '@/backend/Td';
import { mapGetters, mapMutations, mapState } from 'vuex';
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
        },
        templates: {
            type: Object as () => {
            'use-event-template': Boolean,
            'use-action-template': Boolean,
            'use-read-template': Boolean,
            },
            required: true
        }
    },
    data() {
        return {

        };
    },
    computed: {

    },
    methods: {
        ...mapState('MashupStore', ['allAnnotations']),
        ...mapMutations('MashupStore', ['setInteractionRestriction']),
        showColumn(column: WADE.ListInterface): boolean {
            const result: boolean = true;
            if (column.items.length === 0) return false;
            if (column.header === 'PropertyReads' && this.templates['use-read-template'] === false) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }
            if (column.header === 'EventSubs' && this.templates['use-event-template'] === false) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }
            if (column.header === 'PropertyObservations' && this.templates['use-event-template'] === false) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }
            if (column.header === 'ActionReads' && this.templates['use-action-template'] === false) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }
            if (column.header === 'ActionInvokes' && !this.filters.acceptedOutputInteractionTypes.includes('action-invoke')) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }
            if (column.header === 'PropertyWrites' && !this.filters.acceptedOutputInteractionTypes.includes('property-write')) {
                for (const item of column.items) {
                    const interaction  = item.payload as MAGE.VueInteractionInterface;
                    (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                }
                return false;
            }

            return true;
        },
        showInteraction(interaction: MAGE.VueInteractionInterface): boolean {
            const allAnnotations = (this as any).allAnnotations();
            let result: boolean = true;
            if (!this.filters.acceptedTypes.includes(interaction.dataType)) {
                (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                return false;
            }
            switch (interaction.type) {
                case 'property-read':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.propertyReads.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
                case 'property-write':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.propertyWrites.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
                case 'event-subscribe':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.eventSubs.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
                case 'property-observe':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.propertyObservations.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
                case 'action-read':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.actionReads.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
                case 'action-invoke':
                    for (const annotation of interaction.annotations) {
                        if (allAnnotations.actionInvokes.some(a => a.annotation === annotation && a.restriction === 'forbidden')) {
                            (this as any).setInteractionRestriction({interaction, restriction: 'none'});
                            result = false;
                            break;
                        }
                    }
                    break;
            }
            return result;
        },
        isCheckedClass(interaction: MAGE.VueInteractionInterface, category: 'none' | 'forbidden' | 'mustHave') {
            if (interaction.restriction === category) return 'checked-class';
            return null;
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
    height: 175pt;
}

.add-icon {
    width: 20%;
    height: 100%;
}

.checked-class {
    background-color: #b5dfdd;
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
    height: 19%;
    padding-left: 2pt;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    border-bottom: 0.5pt solid #393B3A;
}

.label-area {
    height: 100%;
    width: 50%;
    overflow: hidden;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}

.label-area label {
    text-overflow: ellipsis;
    overflow: hidden;
}

.image-selector {
    height: 100%;
    width: 50%;
    display: flex;
    flex-flow: nowrap row;
    justify-content: space-between;
    align-items: center;
}
.image-selector input{
    margin: 15%;
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

.selection-item-icon {
    max-height: 100%;
    width: 35%;
    padding: 2pt;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
}

.selection-item-icon img {
    padding: 0 !important;
}

</style>