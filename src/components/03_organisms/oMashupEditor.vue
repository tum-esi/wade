<template>
    <div class="mashup-editor-container">
        <label v-if="mashupTds.length <= 0">You have not added any Thing Descriptions to this Mashup.</label>
        <div v-else> 
            <label>Chosen Thing Descriptions</label>
            <div class="chosen-tds">
                <div
                    v-for="(element, index) in this.mashupTds"
                    :key="index"
                >
                    <label>{{ element.id }}</label>
                    </br>
                </div>
            </div>
        </div>

        <label v-if="tds.length > 0">Please add one or more Thing Description</label>
        <label v-if="tds.length <= 0">There are no stored Thing Descriptions. Please create at least one.</label>
        <div v-else class="add-tds-container">
            <aDropdownButton
                :btnLabel="'Add Thing Description'"
                :btnKey="'add-td-to-mashup'"
                :btnSrc="'add'"
                :btnDropdownOptions="getDropdownOptions"
                :btnStyle="'dropdown-container-mashup-tds'"
                :btnIconStyle="''"
                v-on:dropdown-clicked="addTdToMashup"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';

export default Vue.extend({
    name: 'oMashupEditor',
    components: {
        aDropdownButton
    },
    props: {
        mashup: {
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
                if (td.id === args.btnValue) {
                    this.mashupTds.push(td);
                }
            }
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
}

.chosen-tds {

}
</style>
