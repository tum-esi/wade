<template>
<div class="flex-container-row">
    <div id="form-area" class="flex-container-row">
        <!-- Defining Things to be either inputs or outputs-->
        <div class="input-output-area round-top-left-corner round-bottom-left-corner shadow">
            <div class="round-top-left-corner table-header flex-container-row shadow">
                <label class="margin-right-auto">
                    Inputs
                </label>
                <aDropdownButton
                    class="add-icon"
                    :class="'select-mashup-dropdown-btn'"
                    :btnKey="'add-input'"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getMashupChildrenForDropdown ? getMashupChildrenForDropdown : []" 
                    v-on:dropdown-clicked="onAddElementSelected"
                    />
            </div>
            <div class="table">
                <div class="io-element flex-container-row" v-for="(id, name, index) in getInputsIds" :key="id">
                    <label class="io-label margin-right-auto">{{id}}</label>
                    <aIcon
                    class="io-remove-icon"
                    :specificStyle="'mage-minus-icon'"
                    :iconSrcPath="'minus'"
                    :mouseOverIconSrcPath="'minus_white'"
                    :iconClickAction="'removeElement'"
                    @icon-clicked="deleteFromIO(index, 'inputs')"
                    />
                </div> 
            </div>
        </div>
        <div class="input-output-area shadow">
            <div class="table-header flex-container-row shadow">
                <label class="margin-right-auto">
                    Outputs
                </label>
                <aDropdownButton
                    class="add-icon"
                    :class="'select-mashup-dropdown-btn'"
                    :btnKey="'add-output'"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getMashupChildrenForDropdown ? getMashupChildrenForDropdown : []"
                    v-on:dropdown-clicked="onAddElementSelected"
                />
            </div>
            <div class="table">
                <div class="io-element flex-container-row" v-for="(id, name, index) in getOutputsIds" :key="id">
                    <label class="io-label margin-right-auto">{{id}}</label>
                    <aIcon
                    class="io-remove-icon"
                    :specificStyle="'mage-minus-icon'"
                    :iconSrcPath="'minus'"
                    :mouseOverIconSrcPath="'minus_white'"
                    :iconClickAction="'removeElement'"
                    @icon-clicked="deleteFromIO(index, 'outputs')"
                    />
                </div> 
            </div>
        </div>
        <div class="input-output-area round-top-right-corner round-bottom-right-corner shadow">
            <div class="table-header flex-container-row round-top-right-corner shadow">
                <label class="margin-right-auto">
                    Input/Output
                </label>
                <aDropdownButton
                    class="add-icon"
                    :class="'select-mashup-dropdown-btn'"
                    :btnKey="'add-io'"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getMashupChildrenForDropdown ? getMashupChildrenForDropdown : []"
                    v-on:dropdown-clicked="onAddElementSelected"
                />
            </div>
            <div class="table">
                <div class="io-element flex-container-row" v-for="id in getIosIds" :key="id">
                    <label class="io-label margin-right-auto">{{id}}</label>
                    <aIcon
                    class="io-remove-icon"
                    :specificStyle="'mage-minus-icon'"
                    :iconSrcPath="'minus'"
                    :mouseOverIconSrcPath="'minus_white'"
                    :iconClickAction="'removeElement'"
                    @icon-clicked="deleteFromIO(index, 'ios')"
                    />
                </div> 
            </div>
        </div>
        <!--Restricting number of interactions-->
        <div id="interaction-restrictions-area">
            <div class="restricton-option-area flex-container-row">
                <div class="interaction-restrictions-header margin-right-auto">
                    <label>Number of input interactions per mashup:</label>
                </div>
                <div class="flex-container-row align-content-center">
                    <label>Min:</label>
                    <input type="number" :min="1" v-model.number="minInputInteractions" @change="setMaxOutputInteractions">
                </div>
                <div class="flex-container-row align-content-center">
                    <label>Max:</label>
                    <input 
                    type="number" 
                    :min="minInputInteractions" 
                    v-model.number="maxOutputInteractions"
                    @change="setMaxOutputInteractions"
                    >
                </div>
            </div>
            <div class="restricton-option-area flex-container-row">
                <label class="interaction-restrictions-header margin-right-auto">Number of output interactions per mashup:</label>
                <div>
                </div>
            </div>
        </div>

    </div>      
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import {mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import {ElementTypeEnum} from '@/util/enums';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aIcon from '@/components/01_atoms/aIcon.vue';
import { EventEmitter } from 'events';
import {Mashup, TD} from '@/lib/classes';

export default Vue.extend({
    components: {
        aDropdownButton,
        aIconButton,
        aIcon
    },

    data() {
        return {
            mashupData: {} as Mashup,
            children: [] as Array<TD | Mashup>,
            childNeeded: {} as TD | Mashup,
            event: Object,
            minInputInteractions: 1,
            maxOutputInteractions: 2
        };
    },

    computed: {
        ...mapState('MashupStore', ['currentMashup', 'inputs', 'outputs', 'ios']),
        ...mapGetters('SidebarStore', ['getSidebarElement']),
        ...mapGetters('MashupStore', ['getMashupChildren', 'getMashupChildrenForDropdown', 'isMashupSelected',
        'getInputsIds', 'getOutputsIds', 'getIosIds']),
    },

    methods: {
        onCurrentMashupSelected(event) {
            this.event = event;
            if (event.btnValue === 'add-new-mashup') {

            } else {
                const mashupData = (this as any).getSidebarElement({ id: event.btnValue });
                this.$store.commit('MashupStore/setCurrentMashup', mashupData);
            }
        },
        onAddElementSelected(event) {
            this.event = event;
            const children: Array<TD | Mashup> = this.$store.getters['MashupStore/getMashupChildren'];
            this.children = children;
            let childNeeded;
            for (const child of children) {
                if (child.id === event.btnValue) childNeeded = child;
            }
            switch (event.btnKey) {
                case 'add-input': this.$store.commit('MashupStore/addToInputs', childNeeded); break;
                case 'add-output': this.$store.commit('MashupStore/addToOutputs', childNeeded); break;
                case 'add-io': this.$store.commit('MashupStore/addToIos', childNeeded); break;
                default: return;
            }
        },
        deleteFromIO(elementIndex: number, table: string) {
            switch(table) {
                case 'inputs': this.$store.commit('MashupStore/removeFromInputs', elementIndex); break;
                case 'outputs': this.$store.commit('MashupStore/removeFromOutputs', elementIndex); break;
                case 'ios': this.$store.commit('MashupStore/removeFromIos', elementIndex); break;
                default: return;
            }
        },
        setMaxOutputInteractions(): void {
            this.maxOutputInteractions  = this.minInputInteractions > this.maxOutputInteractions ? this.minInputInteractions : this.maxOutputInteractions;
        }
    }
});
</script>

<style lang="less" scoped>
    #mage-container{
        align-content: flex-start;
    }

    #selection-container {
        height: 100%;
        width: 25%;
        margin-right: 1%;
    }

    #select-mashup-container {
        height: 8%;
        width: 100%;
        background: #b5dfdd;
    }

    #child-restrictions-container{
        width: 100%;
        height: 100%;
    }

    #label-container {
        width: 100%;
        height: 20px;
        margin-left: 10px;
    }

    #form-area {
        width: 100%;
        align-content: flex-start;
        overflow: scroll;
    }

    #interaction-restrictions-area {
        width: 100%;
        height: 20%;
        margin-top: 5%;
    }

    .align-content-center {
        align-content: center;
    }

    .shadow {
        box-shadow: 0 6px 3px rgba(0, 0, 0, 0.19);
    }

    .label {
        width: 100%;
        height: 100%;
    }

    .flex-container {
        display: flex;
    }

    .flex-container-column {
        display: flex;
        flex-direction: column;
    }

    .flex-container-row {
        display: flex;
        flex-flow: row wrap;
    }

    .add-icon {
        width: 20%;
        height: 100%;
    }

    .full-width {
        width: 100%;
    }

    .full-height {
        height: 100%;
    }

    .margin-right-auto {
        margin-right: auto;
    }

    .input-output-area {
        width: 33.3333333%;
        background-color: white;
        height: 50%;
    }

    .table-header {
        height: 16%;
        width: 100%;
        padding: 2%;
        align-content: center;
        align-items: center;
        background-color: #b5dfdd;
        font-size: 1.41vw;
    }

    .io-element {
        height: 15%;
        width: 100%;
        padding: 4%;
    }

    .io-element:hover {
        background: #939C9E;
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
    }

    .table {
        height: 84%;
        width: 100%;
        overflow: scroll;
    }

    .restricton-option-area {
        width: 100%;
        height: 33.33333333%;
        background-color: white;
        align-content: center;
        font-size: 12pt;
        border-radius: 10px;
    }

    .interaction-restrictions-header {
        width: 45%;
        height: 100%;
        flex-flow: row wrap;
        align-content: center;
        background-color: #b5dfdd;
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