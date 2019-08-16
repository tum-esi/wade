<template>
    <div class="mashup-editor-container">
        <div v-if="mashupTds.length <= 0">
            <label>
                You have not added any Thing Descriptions to this Mashup. 
            </label>
        </div>
        <div v-else class="chosen-td-container"> 
            <div class="chosen-td-label">
                <label>Chosen Thing Descriptions</label>
            </div>
            <div class="chosen-tds">
                <mMashupTdElement 
                    v-for="(element, index) in this.mashupTds"
                    :key="index"
                    :td="element"
                />
            </div>
        </div>

        <label v-if="tds.length > 0">Please add one or more Thing Description</label>
        <div v-else-if="tds.length <= 0">
            <label>There are no stored Thing Descriptions. Please create at least one.</label>
                <aIconButton
                    class="add-new-td"
                    :iconBtnSrcPath="'add'"
                    :iconBtnOnClick="'open-modal-element'"
                    :iconBtnStyle="'btn-img-mashup-add'"
                    v-on:open-modal-element="openModal"
                />
        </div>
        <div v-if="tds.length > 0" class="add-tds-container">
            <aDropdownButton
                :class="'add-td-dropdown-btn'"
                :btnLabel="'Add Thing Description'"
                :btnKey="'add-td-to-mashup'"
                :btnSrc="'add'"
                :btnDropdownOptions="getDropdownOptions"
                :btnStyle="'dropdown-container-mashup-tds'"
                :btnIconStyle="'mashup-icon-style'"
                v-on:dropdown-clicked="addTdToMashup"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import mMashupTdElement from '@/components/02_molecules/mMashupTdElement.vue';
import { ElementTypeEnum } from '../../util/enums';

export default Vue.extend({
    name: 'oMashupEditor',
    components: {
        aDropdownButton,
        aIconButton,
        mMashupTdElement
    },
    props: {
        mashup: {
            type: Object as () => any,
            required: true
        },
        mashupTds: {
            type: Array as () => any[],
            required: true
        },
        tds: {
            type: Array as () => any[],
            required: true
        }
    },
    data() {
        return {
            dropdownOptions: [] as any[]
        };
    },
    computed: {
        getDropdownOptions(): WADE.DropdownOptionInterface[] {
            this.dropdownOptions = [];
            for (const td of this.tds) {
                this.dropdownOptions.push({ title: td.id, key: td.id });
            }
            return this.dropdownOptions;
        }
    },
    methods: {
        addTdToMashup(args) {
            for (const td of this.tds) {
                if (td.id === args.btnValue && this.mashupTds.indexOf(td) === -1) {
                    this.mashupTds.push(td);
                }
            }
        },
        openModal() {
            this.$eventHub.$emit('open-modal-element', { btnValue: ElementTypeEnum.TD, parentId: this.mashup.id });
        }
    }
});
</script>


<style scoped>
.mashup-editor-container {
    height: 85%;
    padding: 7px;
    text-align: center;
}

.add-tds-container {
    height: 8%;
    width: 80%;
    margin: 0 auto;
    background: #b5dfdd;
}

.add-tds-container:hover {
    background: #92afae !important;
}

.chosen-td-container {
    padding-top: 7px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    width: 100%;
    margin: 0 auto;
}

.chosen-td-label {
    padding: 0px 7px 7px 7px;
}

.add-new-td {
    width: 60px;
    height: 45px;
    margin: 0 auto;
}
</style>
