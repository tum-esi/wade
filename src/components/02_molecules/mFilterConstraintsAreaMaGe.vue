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
                    :checked="typeIsChecked('null')"
                    :disabled="disableType('null')"
                    @input="$emit('change', onTypeConstraintChanged('null', $event.target.checked))"> 
                    <label>Null</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('string')" 
                    :checked="typeIsChecked('string')" 
                    @input="$emit('change', onTypeConstraintChanged('string', $event.target.checked))"> 
                    <label>String</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('integer')"
                    :checked="typeIsChecked('integer')" 
                    @input="$emit('change', onTypeConstraintChanged('integer', $event.target.checked))"> 
                    <label>Integer</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('number')"
                    :checked="typeIsChecked('number')" 
                    @input="$emit('change', onTypeConstraintChanged('number', $event.target.checked))">
                    <label>Number</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('boolean')"
                    :checked="typeIsChecked('boolean')" 
                    @input="$emit('change', onTypeConstraintChanged('boolean', $event.target.checked))">
                    <label>Boolean</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('array')"
                    :checked="typeIsChecked('array')" 
                    @input="$emit('change', onTypeConstraintChanged('array', $event.target.checked))">
                    <label>Array</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableType('object')"
                    :checked="typeIsChecked('object')"
                    @input="$emit('change', onTypeConstraintChanged('object', $event.target.checked))">
                    <label>Object</label>
                </div>
            </div>
            <div>
                <h4>Input Interactions Restrictions</h4>
                <div>
                    <input type="checkbox"
                    :disabled="disableInputRestriction('allowMixedTemplates')"
                    v-model="filters.allowMixedTemplates">
                    <label>Allow Mixed Templates</label>
                </div>
                <h4>Output Interactions Restrictions</h4>
                <div>
                    <input type="checkbox"
                    :disabled="disableOutputType('action-invoke')"
                    :checked="outputTypeIsChecked('action-invoke')"
                    @input="$emit('change', onOutputTypeConstraintChanged('action-invoke', $event.target.checked))">
                    <label>Allow Action Invokes</label>
                </div>
                <div>
                    <input type="checkbox"
                    :disabled="disableOutputType('property-write')"
                    :checked="outputTypeIsChecked('property-write')"
                    @input="$emit('change', onOutputTypeConstraintChanged('property-write', $event.target.checked))">
                    <label>Allow Property Writes</label>
                </div>
                <h4>Interaction Matching Criteria</h4>
                <div>
                    <input type="checkbox"
                    :checked="filters.onlySameType"
                    @input="$emit('change', onCheckBoxChecked('onlySameType',$event.target.checked))">
                    <label>Only match interactions that have similar types</label>
                </div>
                <div>
                    <input type="checkbox"
                    :checked="filters.onlySimilarNames"
                    @input="$emit('change', onCheckBoxChecked('onlySimilarNames',$event.target.checked))">
                    <label>Only match interactions that have similar names</label>
                </div>
                <div v-show="filters.onlySimilarNames && filters.similarityThresholdNames">
                    <label class="margin-right-2pt">Similarity Threshold:</label>
                    <input type="range" min="0" max="1" step="0.01" v-model="filters.similarityThresholdNames">
                    <input class="fit-content" type="number" min="0" max="1" step="0.01" v-model="filters.similarityThresholdNames">
                </div>
                <div>
                    <input type="checkbox"
                    :checked="filters.onlySimilarDescriptions"
                    @input="$emit('change', onCheckBoxChecked('onlySimilarDescriptions',$event.target.checked))">
                    <label>Only match interactions that have similar descriptions</label>
                </div>
                <div v-show="filters.onlySimilarDescriptions && filters.similarityThresholdDescriptions">
                    <label class="margin-right-2pt">Similarity Threshold:</label>
                    <input type="range" min="0" max="5" step="0.01" v-model="filters.similarityThresholdDescriptions">
                    <input class="fit-content" type="number" min="0" max="5" step="0.01" v-model="filters.similarityThresholdDescriptions">
                </div>
                <div>
                    <input type="checkbox"
                    :checked="filters.semanticMatch"
                    @input="$emit('change', onCheckBoxChecked('semanticMatch', $event.target.checked))">
                    <label>Only match interactions that have the same semantic ("@type") context.</label>
                </div>
            </div>
        </div>
        <div id="ltl-restriction">
            <h4 v-if="showTdAnnotationsTable">Restrictions on TD Annotations</h4>
            <mTdAnnotationSelectionMaGe v-if="showTdAnnotationsTable" :table="TdAnnotationsTable"/>
            <h4 v-if="showAnnotationsTable">Restrictions on Interaction Annotations</h4>
            <mAnnotationSelectionMaGe v-if="showAnnotationsTable" :table="AnnotationsTable" :filters="filters" :templates="templates"/>
            <h4 v-if="showInteractionsTable">Restrictions on individual Interactions</h4>
            <mInteractionSelectionMaGe v-if="showInteractionsTable" :table="InteractionsTable" :filters="filters" :templates="templates"/>
        </div>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import mInteractionSelectionMaGe from '@/components/02_molecules/mInteractionSelectionMaGe.vue';
import mAnnotationSelectionMaGe from '@/components/02_molecules/mAnnotationSelectionMaGe.vue';
import mTdAnnotationSelectionMaGe from '@/components/02_molecules/mTdAnnotationSelectionMaGe.vue';
import { mapGetters, mapState } from 'vuex';
export default Vue.extend({
    name: 'mFilterConstraintsAreaMaGe',
    model: {
        prop: 'filters',
        event: 'change'
    },
    props: {
        filters: {
            type: Object as () => MAGE.FiltersInterface,
            required: false,

        },
        templates: {
            type: Object as () => {
            'use-event-template': boolean,
            'use-action-template': boolean,
            'use-sub-template': boolean,
            },
            required: true
        }
    },
    components: {
        mInteractionSelectionMaGe,
        mAnnotationSelectionMaGe,
        mTdAnnotationSelectionMaGe
    },
    data() {
        return {
            typeWasDisabled: {
                null: true,
                integer: true,
                number: true,
                string: true,
                boolean: true,
                array: true,
                object: true
            },
            outputTypeWasDisabled: {
                'property-write': true,
                'action-invoke': true
            },

        };
    },
    computed: {
        ...mapState('MashupStore', ['allInteractions', 'allAnnotations', 'allTdAnnotations']),
        InteractionsTable() {
            const allInteractions = (this as any).allInteractions;
            const table: WADE.TableInterface = {columns: []};
            const listW: WADE.ListInterface = {header: 'PropertyWrites', items: []};
            const listR: WADE.ListInterface = {header: 'PropertyReads', items: []};
            const listE: WADE.ListInterface = {header: 'EventSubs', items: []};
            const listAR: WADE.ListInterface = {header: 'ActionReads', items: []};
            const listA: WADE.ListInterface = {header: 'ActionInvokes', items: []};
            const listO: WADE.ListInterface = {header: 'PropertyObservations', items: []};
            for (const interactiontype in allInteractions) {
                switch (interactiontype) {
                    case 'propertyWrites':
                        const propertyWrites = allInteractions[interactiontype];
                        for (const prop of propertyWrites) {
                            listW.items.push({
                                label: `${prop.title}: ${prop.name}`,
                                payload: prop
                            });
                        }
                        break;
                    case 'propertyReads':
                        const propertyReads = allInteractions[interactiontype];
                        for (const prop of propertyReads) {
                            listR.items.push({
                                label: `${prop.title}: ${prop.name}`,
                                payload: prop
                            });
                        }
                        break;
                    case 'eventSubs':
                        const eventSubs = allInteractions[interactiontype];
                        for (const event of eventSubs) {
                            listE.items.push({
                                label: `${event.title}: ${event.name}`,
                                payload: event
                            });
                        }
                        break;
                    case 'actionInvokes':
                        const actionInvokes = allInteractions[interactiontype];
                        for (const action of actionInvokes) {
                            listA.items.push({
                                label: `${action.title}: ${action.name}`,
                                payload: action
                            });
                        }
                        break;
                    case 'actionReads':
                        const actionReads = allInteractions[interactiontype];
                        for (const action of actionReads) {
                            listAR.items.push({
                                label: `${action.title}: ${action.name}`,
                                payload: action
                            });
                        }
                        break;
                    case 'propertyObservations':
                        const propertyObservations = allInteractions[interactiontype];
                        for (const observation of propertyObservations) {
                            listO.items.push({
                                label: `${observation.title}: ${observation.name}`,
                                payload: observation
                            });
                        }
                        break;
                }
            }
            table.columns.push(listR);
            table.columns.push(listO);
            table.columns.push(listE);
            table.columns.push(listAR);
            table.columns.push(listW);
            table.columns.push(listA);
            return table;
        },
        AnnotationsTable() {
            const allAnnotations = (this as any).allAnnotations;
            const table: WADE.TableInterface = {columns: []};
            const listW: WADE.ListInterface = {header: 'PropertyWrites', items: []};
            const listR: WADE.ListInterface = {header: 'PropertyReads', items: []};
            const listE: WADE.ListInterface = {header: 'EventSubs', items: []};
            const listAR: WADE.ListInterface = {header: 'ActionReads', items: []};
            const listA: WADE.ListInterface = {header: 'ActionInvokes', items: []};
            const listO: WADE.ListInterface = {header: 'PropertyObservations', items: []};
            for (const annotationtype in allAnnotations) {
                switch (annotationtype) {
                    case 'propertyWrites':
                        const propertyWrites = allAnnotations[annotationtype];
                        for (const annotation of propertyWrites) {
                            listW.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'propertyReads':
                        const propertyReads = allAnnotations[annotationtype];
                        for (const annotation of propertyReads) {
                            listR.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'eventSubs':
                        const eventSubs = allAnnotations[annotationtype];
                        for (const annotation of eventSubs) {
                            listE.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'actionInvokes':
                        const actionInvokes = allAnnotations[annotationtype];
                        for (const annotation of actionInvokes) {
                            listA.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'actionReads':
                        const actionReads = allAnnotations[annotationtype];
                        for (const annotation of actionReads) {
                            listAR.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                     case 'propertyObservations':
                        const propertyObservations = allAnnotations[annotationtype];
                        for (const annotation of propertyObservations) {
                            listO.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                }
            }
            table.columns.push(listR);
            table.columns.push(listO);
            table.columns.push(listE);
            table.columns.push(listAR);
            table.columns.push(listW);
            table.columns.push(listA);
            return table;
        },
        TdAnnotationsTable() {
            const allTdAnnotations = (this as any).allTdAnnotations;
            const table: WADE.TableInterface = {columns: []};
            const listI: WADE.ListInterface = {header: 'Inputs', items: []};
            const listO: WADE.ListInterface = {header: 'Outputs', items: []};
            const listIo: WADE.ListInterface = {header: 'Ios', items: []};
            for (const annotationtype in allTdAnnotations) {
                switch (annotationtype) {
                    case 'inputs':
                        const inputs = allTdAnnotations[annotationtype];
                        for (const annotation of inputs) {
                            listI.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'outputs':
                        const outputs = allTdAnnotations[annotationtype];
                        for (const annotation of outputs) {
                            listO.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                    case 'ios':
                        const ios = allTdAnnotations[annotationtype];
                        for (const annotation of ios) {
                            listIo.items.push({
                                label: `${annotation.annotation}`,
                                payload: annotation
                            });
                        }
                        break;
                }
            }
            table.columns.push(listI);
            table.columns.push(listO);
            table.columns.push(listIo);
            return table;
        },
        showInteractionsTable(): boolean {
            const allInteractions = (this as any).allInteractions;
            const result: boolean = false;
            for (const interactionType in allInteractions) {
                if (allInteractions[interactionType].length > 0) return true;
            }
            return result;
        },
        showAnnotationsTable(): boolean {
            const allAnnotations = (this as any).allAnnotations;
            const result: boolean = false;
            for (const interactionType in allAnnotations) {
                if (allAnnotations[interactionType].length > 0) return true;
            }
            return result;
        },
        showTdAnnotationsTable(): boolean {
            const allTdAnnotations = (this as any).allTdAnnotations;
            const result: boolean = false;
            for (const interactionType in allTdAnnotations) {
                if (allTdAnnotations[interactionType].length > 0) return true;
            }
            return result;
        }
    },
    methods: {
        typeIsChecked(type: MAGE.acceptedTypesEnum): boolean {
            return this.filters.acceptedTypes.includes(type);
        },
        disableType(type: MAGE.acceptedTypesEnum): boolean {
            const interactions  = (this as any).allInteractions;
            const filters = this.filters;
            for (const interactionType in interactions) {
                if ((interactions[interactionType] as MAGE.VueInteractionInterface[]).some((i) => i.dataType === type)) {
                    if (!filters.acceptedTypes.includes(type) && this.typeWasDisabled[type] === true) {
                        filters.acceptedTypes.push(type);
                        this.typeWasDisabled[type] = false;
                        this.$emit('change', filters);
                    }
                    return false;
                }
            }
            if (filters.acceptedTypes.includes(type) && this.typeWasDisabled[type] === false) {
                filters.acceptedTypes.splice(filters.acceptedTypes.indexOf(type), 1);
                this.typeWasDisabled[type] = true;
                this.$emit('change', filters);
            }
            return true;
        },
        disableInputRestriction(type: 'allowMixedTemplates'): boolean {
            switch (type) {
               case 'allowMixedTemplates':
                   return false;
                   break;
            }
        },
        disableOutputType(type: 'property-write' | 'action-invoke'): boolean {
            const interactions  = (this as any).allInteractions;
            const filters = this.filters;
            for (const interactionType in interactions) {
                if ((interactions[interactionType] as MAGE.VueInteractionInterface[]).some((i) => i.type === type)) {
                    if (!filters.acceptedOutputInteractionTypes.includes(type) && this.outputTypeWasDisabled[type] === true) {
                        filters.acceptedOutputInteractionTypes.push(type);
                        this.outputTypeWasDisabled[type] = false;
                        this.$emit('change', filters);
                    }
                    return false;
                }
            }
            if (filters.acceptedOutputInteractionTypes.includes(type) && this.outputTypeWasDisabled[type] === false) {
                filters.acceptedOutputInteractionTypes.splice(filters.acceptedOutputInteractionTypes.indexOf(type), 1);
                this.outputTypeWasDisabled[type] = true;
                this.$emit('change', filters);
            }
            return true;
        },
        outputTypeIsChecked(type: 'action-invoke' | 'property-write'): boolean {
            return this.filters.acceptedOutputInteractionTypes.includes(type);
        },
        onTypeConstraintChanged(type: MAGE.acceptedTypesEnum, checked: boolean): MAGE.FiltersInterface {
            const filters = this.filters;
            if      (checked && !filters.acceptedTypes.includes(type)) filters.acceptedTypes.push(type);
            else if (!checked && filters.acceptedTypes.includes(type)) filters.acceptedTypes.splice(filters.acceptedTypes.indexOf(type), 1);

            return filters;
        },
        onOutputTypeConstraintChanged(type: 'action-invoke' | 'property-write', checked: boolean): MAGE.FiltersInterface {
            const filters = this.filters;
            if      (checked && !filters.acceptedOutputInteractionTypes.includes(type)) filters.acceptedOutputInteractionTypes.push(type);
            else if (!checked && filters.acceptedOutputInteractionTypes.includes(type)) filters.acceptedOutputInteractionTypes.splice(filters.acceptedOutputInteractionTypes.indexOf(type), 1);

            return filters;
        },
        onCheckBoxChecked(prop: string, checked: boolean): MAGE.FiltersInterface {
            const filters = this.filters;
            filters[prop] = checked;
            if (prop === 'onlySimilarNames') {
                if (checked) filters.similarityThresholdNames = 0.5;
                else filters.similarityThresholdNames = null;
            }
            if (prop === 'onlySimilarDescriptions') {
                if (checked) filters.similarityThresholdDescriptions = 0.5;
                else filters.similarityThresholdDescriptions = null;
            }
            return filters;
        }
    },
});
</script>

<style lang="less" scoped>
#ltl-restriction {
    height: fit-content;
}

.filters-container {
    border: 0.5pt solid #393B3A;
    height: fit-content;
    border-radius: 3pt;
    padding-right: 0.1pt;
}

.filters-container input{
    margin-right: 2pt;
}

.filters-container h4{
    margin-left: 2pt;
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
    height: fit-content;
}

.fit-content {
    width: 35pt;
}

.margin-right-2pt {
    margin-right: 2pt;
}

</style>