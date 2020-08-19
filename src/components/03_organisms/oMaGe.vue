<template>
<div class="flex-container-row">
    <div id="form-area" class="flex-container-row">
        <!--Selecting Elements for Mashup-->
        <mTableMaGe id="mage-table" :table="table"/>
        <!--Restricting number of interactions and Elements in Mashups-->
        <div id="interaction-restrictions-area">
            <div class="restricton-option-area flex-container-row justify-content-even">
                <div class="interaction-restrictions-header margin-right-auto align-items-center">
                    <label>Number of input interactions per mashup:</label>
                </div>
                <div class="flex-container-row align-items-center">
                    <label>Min:</label>
                    <input type="number" :min="1" v-model.number="generationForm.minInputs" @input="setMaxInputInteractions">
                </div>
                <div class="flex-container-row align-items-center">
                    <label>Max:</label>
                    <input type="number" :min="generationForm.minInputs" v-model.number="generationForm.maxInputs"
                    @input="setMaxInputInteractions"
                    >
                </div>
            </div>
            <div class="restricton-option-area flex-container-row justify-content-even">
                <div class="interaction-restrictions-header margin-right-auto align-items-center">
                    <label>Number of output interactions per mashup:</label>
                </div>
                <div class="restrictions-input-area flex-container-row align-items-center">
                    <label>Min:</label>
                    <input type="number" :min="1" v-model.number="generationForm.minOutputs" @input="setMaxOutputInteractions">
                </div>
                <div class="flex-container-row align-items-center">
                    <label>Max:</label>
                    <input type="number" :min="generationForm.minOutputs" v-model.number="generationForm.maxOutputs"
                    @input="setMaxOutputInteractions"
                    >
                </div>
            </div>
            <div class="restricton-option-area flex-container-row justify-content-even">
                <div class="interaction-restrictions-header margin-right-auto align-items-center">
                    <label>Number of Elements in the Mashup:</label>
                </div>
                <div class="restrictions-input-area flex-container-row align-items-center">
                    <input type="checkbox" v-model="limitNumberOfElement">
                    <label>Limit number of elements</label>
                </div>
                <div v-show="limitNumberOfElement" class="flex-container-row align-items-center">
                    <label>Max number of Elements:</label>
                    <input type="number" :min="2" :max="100" :disabled="!limitNumberOfElement"  v-model.number="generationForm.maxThings"
                    @input="setMaxOutputInteractions"
                    >
                </div>
            </div>
        </div>
        <!--Selecting templates for Mashup Generation-->
        <mTemplateSelectionArea id="template-selection-area" v-model="generationForm.templates"/>
        <!--Filters and Constraints-->
        <mFilterConstraintsAreaMaGe id="filters-area" v-model="generationForm.filters"/>
        <aButtonBasic
        btnLabel="Generate Mashups"
        btnClass="btn-grey"
        btnOnClick="generate-mashups"
        v-on:generate-mashups="generateMashups(generationForm)"
        />
    </div>      
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { EventEmitter } from 'events';
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import { ElementTypeEnum } from '@/util/enums';
import { Mashup, TD, GenerationForm } from '@/lib/classes';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIcon from '@/components/01_atoms/aIcon.vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aListSimple from '@/components/01_atoms/aListSimple.vue';
import mTableSimple from '@/components/02_molecules/mTableSimple.vue';
import mTableMaGe from '@//components/02_molecules/mTableMaGe.vue';
import mTemplateSelectionArea from '@/components/02_molecules/mTemplateSelectionAreaMaGe.vue'
import mFilterConstraintsAreaMaGe from '@/components/02_molecules/mFilterConstraintsAreaMaGe.vue'
import { watch } from 'fs';
import generateMashups from '@/backend/MaGe/generator';

export default Vue.extend({
    components: {
        aButtonBasic,
        aDropdownButton,
        aIconButton,
        aIcon,
        aListSimple,
        mTableSimple,
        mTableMaGe,
        mTemplateSelectionArea,
        mFilterConstraintsAreaMaGe
    },

    data() {
        return {
            limitNumberOfElement: false,
            generationForm: new GenerationForm(),
            result: {}
        };
    },

    computed: {
        ...mapState('MashupStore', ['currentMashup', 'inputs', 'outputs', 'ios']),
        ...mapGetters('SidebarStore', ['getSidebarElement']),
        ...mapGetters('MashupStore', ['getMashupChildren', 'getMashupChildrenForDropdown', 'isMashupSelected',
        'getInputsIds', 'getOutputsIds', 'getIosIds']),
        inputList(): WADE.ListInterface {
            let list: WADE.ListInterface = {
                header: "Inputs",
                items: (this as any).getInputsIds
            }
            return list;
        },
        outputList(): WADE.ListInterface {
            let list: WADE.ListInterface = {
                header: "Outputs",
                items: (this as any).getOutputsIds
            }
            return list;
        },
        ioList(): WADE.ListInterface {
            let list: WADE.ListInterface = {
                header: "IOs",
                items: (this as any).getIosIds
            }
            return list;
        },
        table(): WADE.TableInterface {
            let table = {
                columns: [this.inputList, this.outputList, this.ioList]
            }
            return table;
        }
    },
    methods: {
        ...mapActions('MashupStore',['generateMashups']),
        onCurrentMashupSelected(event) {
            if (event.btnValue === 'add-new-mashup') {

            } else {
                const mashupData = (this as any).getSidebarElement({ id: event.btnValue });
                this.$store.commit('MashupStore/setCurrentMashup', mashupData);
            }
        },
        onAddElementSelected(event) {
            const children: (TD | Mashup)[] = this.$store.getters['MashupStore/getMashupChildren'];
            let childNeeded;
            for (const child of children) {
                if (child.id === event.btnValue) childNeeded = child;
            }
            switch (event.btnKey) {
                case 'add-input': 
                    this.$store.commit('MashupStore/addToInputs', childNeeded); 
                    this.generationForm.things.inputs.push(childNeeded);
                    break;
                case 'add-output':
                    this.$store.commit('MashupStore/addToOutputs', childNeeded); 
                    this.generationForm.things.outputs.push(childNeeded);
                    break;
                case 'add-io': 
                    this.$store.commit('MashupStore/addToIos', childNeeded);
                    this.generationForm.things.inputs.push(childNeeded);
                    this.generationForm.things.outputs.push(childNeeded);
                    break;
                default: return;
            }
        },
        deleteFromIO(elementIndex: number, table: string) {
            switch(table) {
                case 'inputs': 
                    this.$store.commit('MashupStore/removeFromInputs', elementIndex); 
                    break;
                case 'outputs': 
                    this.$store.commit('MashupStore/removeFromOutputs', elementIndex); 
                    break;
                case 'ios': 
                    this.$store.commit('MashupStore/removeFromIos', elementIndex); 
                    break;
                default: return;
            }
        },
        setMaxInputInteractions(): void {
            this.generationForm.maxInputs = this.generationForm.minInputs > this.generationForm.maxInputs 
            ? this.generationForm.minInputs 
            : this.generationForm.maxInputs;
        },
        setMaxOutputInteractions(): void {
            this.generationForm.maxOutputs = this.generationForm.minOutputs > this.generationForm.maxOutputs 
            ? this.generationForm.minOutputs 
            : this.generationForm.maxOutputs;
        }
    },
})
</script>

<style lang="less" scoped>

    #mage-table {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        height: 33.33333333%;
        margin-bottom: 1.5%;
    }

    #table {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        height: 33.33333333%;
        margin-bottom: 1%;
    }

    #form-area {
        width: 100%;
        height: 100%;
        align-content: flex-start;
        overflow-y: auto;
    }

    #form-area::-webkit-scrollbar {
        display: inline;
    }

    #form-area::-webkit-scrollbar-track {
        background-color: #939C9E;
        border-radius: 5pt;
    }

    #form-area::-webkit-scrollbar-thumb {
        background-color: #b5dfdd;
        border-radius: 5pt;
    }

    #interaction-restrictions-area {
        width: 100%;
        height: 20%;
        margin-bottom: 1.5%;
    }

    #template-selection-area {
        width: 100%;
        height: 56%;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        margin-bottom: 1.5%;
    }

    #filters-area {
        width: 100%;
    }

    .align-items-center {
        align-items: center;
    }

    .justify-content-even {
        justify-content: space-between;
    }

    .shadow {
        box-shadow: 0 6px 3px rgba(0, 0, 0, 0.19);
    }

    .flex-container-row {
        display: flex;
        flex-flow: row wrap;
    }

    .restricton-option-area {
        width: 100%;
        height: 33.33333333%;
        align-content: center;
        font-size: 12pt;
        border: 0.5pt solid #393B3A;
        border-radius: 10px;
        background-color: #b5dfdd;
        padding-right: 3%;
    }

    .interaction-restrictions-header {
        width: 30%;
        height: 100%;
        padding: 5pt;
        display: flex;
        flex-flow: row wrap;
        background-color: #939c9e;
        border-right: 0.5pt solid #393B3A;
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .round-top-left-corner {
        border-top-left-radius: 10pt;
    }

    .round-top-right-corner {
        border-top-right-radius: 10pt;
    }

    .round-bottom-left-corner {
        border-bottom-left-radius: 10pt;
    }

    .round-bottom-right-corner {
        border-bottom-right-radius: 10pt;
    }
</style>