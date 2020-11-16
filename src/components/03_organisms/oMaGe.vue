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
                    <input type="checkbox" v-model="limitNumberOfElement" @input="setMaxElementsFilter($event.target.checked)">
                    <label>Limit number of elements</label>
                </div>
                <div v-show="limitNumberOfElement" class="flex-container-row align-items-center">
                    <label>Max number of Elements:</label>
                    <input type="number" :min="2" :max="100" :disabled="!limitNumberOfElement"  v-model.number="generationForm.maxThings">
                </div>
            </div>
        </div>
        <!--Selecting templates for Mashup Generation-->
        <mTemplateSelectionArea id="template-selection-area" v-model="generationForm.templates"/>
        <!--Filters and Constraints-->
        <mFilterConstraintsAreaMaGe 
        id="filters-area" 
        :class="filterAreaClass"
        v-model="generationForm.filters"
        :templates="generationForm.templates"/>
        <aButtonBasic
        class="generate-button"
        btnLabel="Generate Mashups"
        btnClass="btn-grey"
        btnOnClick="generate-mashups"
        @generate-mashups="onGenerateMashupClick()"
        />
        <mGalleryMermaid
        id="mermaid-all"
        class="gallery" 
        :txtArray="result ? result.imagesMDs : []" 
        :maxPossibleMashups="result ? result.designSpaceSize : 0" 
        @current-mashup-nr="setCurrentViewedMashup"
        v-show="resultReady"/>
        <aButtonBasic
        class="generate-button"
        btnLabel="Generate System Description for the currently viewed Mashup"
        btnClass="btn-grey"
        btnOnClick="generate-sd"
        @generate-sd="generateSD"
        v-show="resultReady"
        />
        <aButtonBasic
        class="generate-button"
        btnLabel="Generate Code for the currently viewed Mashup"
        btnClass="btn-grey"
        btnOnClick="generate-code"
        @generate-code="generateCode"
        v-show="resultReady"
        />
    </div>      
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { EventEmitter } from 'events';
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import { ElementTypeEnum } from '@/util/enums';
import { Mashup, TD } from '@/backend/Td';
import { GenerationForm } from '@/backend/MaGe/generator';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIcon from '@/components/01_atoms/aIcon.vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aListSimple from '@/components/01_atoms/aListSimple.vue';
import aViewerMermaid from '@/components/01_atoms/aViewerMermaid.vue';
import mGalleryMermaid from '@/components/02_molecules/mGalleryMermaid.vue';
import mTableSimple from '@/components/02_molecules/mTableSimple.vue';
import mTableMaGe from '@//components/02_molecules/mTableMaGe.vue';
import mTemplateSelectionArea from '@/components/02_molecules/mTemplateSelectionAreaMaGe.vue';
import mFilterConstraintsAreaMaGe from '@/components/02_molecules/mFilterConstraintsAreaMaGe.vue';
import generateMashups from '@/backend/MaGe/generator.ts';

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
        mFilterConstraintsAreaMaGe,
        aViewerMermaid,
        mGalleryMermaid
    },

    data() {
        return {
            limitNumberOfElement: false,
            currentlyViewedMashup: 0,
            generationForm: new GenerationForm(),
            mermaidDiv: document.getElementById("mermaid-all")
        };
    },

    computed: {
        ...mapState('MashupStore', ['currentMashup', 'result', 'resultReady']),
        ...mapGetters('SidebarStore', ['getSidebarElement']),
        ...mapGetters('MashupStore', ['getMashupChildrenForDropdown', 'getInputsIds', 'getOutputsIds', 'getIosIds']),
        inputList(): WADE.ListInterface {
            let ids: {label: string}[] = [];
            for(let item of (this as any).getInputsIds) {
                ids.push({label: item});
            }
            let list: WADE.ListInterface = {
                header: "Inputs",
                items: ids
            }
            return list;
        },
        outputList(): WADE.ListInterface {
            let ids: {label: string}[] = [];
            for(let item of (this as any).getOutputsIds) {
                ids.push({label: item});
            }
            let list: WADE.ListInterface = {
                header: "Outputs",
                items: ids
            }
            return list;
        },
        ioList(): WADE.ListInterface {
            let ids: {label: string}[] = [];
            for(let item of (this as any).getIosIds) {
                ids.push({label: item});
            }
            let list: WADE.ListInterface = {
                header: "IOs",
               items: ids
            }
            return list;
        },
        table(): WADE.TableInterface {
            let table = {
                columns: [this.inputList, this.outputList, this.ioList]
            }
            return table;
        },
        filterAreaClass() {
            let number = 0;
            console.log()
            number += (this as any).getInputsIds.length;
            number += (this as any).getOutputsIds.length;
            number += (this as any).getIosIds.length;
            
            if(number === 0) return "filters-empty";
            return "filters-full";
        }
    },
    methods: {
        ...mapActions('MashupStore',['generateMashups',"generateMashupCode"]),
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
        },
        setCurrentViewedMashup(nr: number) {
            this.currentlyViewedMashup = nr;
        },
        setMaxElementsFilter(isChecked: boolean) {
            if(isChecked) this.generationForm.maxThings = 2; else this.generationForm.maxThings = -1;
        },
        setMaxElements(maxThings: number) {
            this.generationForm.maxThings = maxThings;
        },
        onGenerateMashupClick() {
            this.$store.dispatch("MashupStore/generateMashups", {generationForm: this.generationForm}).then(() => {
                this.mermaidDiv = document.getElementById("mermaid-all");
                setTimeout(()=> {
                    if(this.mermaidDiv) this.mermaidDiv.scrollIntoView({
                        behavior: "smooth"
                    });
                },3)
                
            })
        },
        generateCode(){
            this.$store.dispatch("MashupStore/generateMashupCode", this.currentlyViewedMashup);
        },
        generateSD(){
            this.$store.dispatch("MashupStore/generateSystemDescription", this.currentlyViewedMashup);
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.mermaidDiv = document.getElementById("mermaid-all");
        });
    }
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

#form-area > * {
    margin-left: 0.2%;
    margin-right: 0.2%;
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

.filters-empty {
    height: fit-content;
}

.filters-full {
    height: 140%;
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
    background-color: #b5dfdd;
    padding-right: 3%;
}

.restricton-option-area:first-of-type {
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
}

.restricton-option-area:last-of-type {
        border-bottom-right-radius: 10px;
        border-bottom-left-radius: 10px;
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

.generate-button {
    width: 100%;
    height: 5%;
    margin: 1% 0.2%;
    background-color: #b5dfdd;
}

.gallery {
    width: 100%;
    margin: 1%;
}
</style>