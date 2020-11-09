<template>
    <div class="flex-box-row" >
        <div :id="getMashupTabbar[0].tabIsActive ? 'elements-area-full' : 'elements-area-minimized'">
            <div v-if="mashupChildren.length <= 0">
                <label>
                    You have not added any Thing Descriptions to this Mashup. 
                </label>
            </div>
            <div v-else class="chosen-td-container"> 
                <div class="chosen-td-label">
                    <label>Chosen Thing Descriptions</label>
                </div>
                <div class="chosen-tds">
                    <mMashupElement 
                        v-for="(element, index) in this.mashupChildren"
                        :key="index"
                        :element="element"
                        v-on:delete-element="deleteElementFromMashup"
                    />
                </div>
            </div>
            <label v-if="availableElements.length > 0">Please add one or more Thing Description</label>
            <div v-else-if="availableElements.length == 0">
                <label>There are no stored Thing Descriptions. Please create at least one.</label>
                    <aIconButton
                        class="add-new-td"
                        :iconBtnSrcPath="'add'"
                        :iconBtnOnClick="'open-modal-element'"
                        :iconBtnStyle="'btn-img-mashup-add'"
                        v-on:open-modal-element="openModal"
                    />
            </div>
            <div v-if="availableElements.length > 0" class="add-tds-container">
                <aDropdownButton
                    :class="'add-td-dropdown-btn'"
                    :btnLabel="'Add Thing Description'"
                    :btnKey="'add-td-to-mashup'"
                    :btnSrc="'add'"
                    :btnDropdownOptions="getDropdownOptions"
                    :btnStyle="'dropdown-container-mashup-tds'"
                    :btnIconStyle="'mashup-icon-style'"
                    v-on:dropdown-clicked="addElementToMashup"
                />
            </div>
        </div>
        <div id="text-editor-area" v-if="getMashupTabbar[0].tabIsActive" :class="'text-editor-area-full'">
           <aEditorMonaco v-model="mashupTd" language="typescript"/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapMutations, mapGetters } from 'vuex';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import mMashupElement from '@/components/02_molecules/mMashupElement.vue';
import { ElementTypeEnum } from '../../util/enums';
import mashup from '@/store/modules/mashup';

export default Vue.extend({
    name: 'oMashupEditor',
    components: {
        aDropdownButton,
        aIconButton,
        aEditorMonaco,
        mMashupElement
    },
    props: {
        mashup: {
            type: Object as () => any,
            required: true
        },
        mashupChildren: {
            type: Array as () => any[],
            required: true
        },
        availableElements: {
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
        ...mapGetters('MashupStore', ['getMashupTabbar', 'getMashupTd']),
        ...mapGetters('SidebarStore', ['getMashup', 'getSidebarElement']),
        getDropdownOptions(): WADE.DropdownOptionInterface[] {
            this.dropdownOptions = [];
            for (const td of this.availableElements) {
                this.dropdownOptions.push({ title: td.id, key: td.id });
            }
            return this.dropdownOptions;
        },
        mashupTd: {
            get(): string {
                return (this as any).getMashupTd;
            },
            set(td: string) {
                this.$store.commit("MashupStore/setMashupTd",td);
            }
        }
    },
    methods: {
        ...mapMutations('SidebarStore', ['deleteSidebarElement', 'deleteElementFromStore']),
        addElementToMashup(args) {
            for (const td of this.availableElements) {
                if (td.id === args.btnValue && this.mashupChildren.indexOf(td) === -1) {
                    this.mashupChildren.push(td);
                }
            }
        },
        openModal() {
            this.$eventHub.$emit('open-modal-element', { btnValue: ElementTypeEnum.TD, parentId: this.mashup.id });
        },
        deleteElementFromMashup(id: string, type: string) {
            (this as any).deleteSidebarElement({id, type});
            (this as any).deleteElementFromStore({id, type});
            this.$eventHub.$emit('sidebar-element-removed', id);
        }
    }
});
</script>


<style scoped>
#elements-area-full {
    width: 25%;
    height: 100%;
    margin-right: 2%;
    text-align: center;
}
 
#elements-area-minimized {
    width: 100%;
    height: 100%;
    text-align: center;
}

#element-text-area-container {
    width: 100%;
    height: 100%;
}

#element-text-area {
    width: 100%;
    height: 100%;
    resize: none;
}

.flex-box-row {
    display: flex;
    flex-flow: row wrap;
}

.mashup-editor-container {
    padding: 1.5%;
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

.full-width {
    width: 100%;
}

.text-editor-area-full {
    width: 73%;
}
</style>
