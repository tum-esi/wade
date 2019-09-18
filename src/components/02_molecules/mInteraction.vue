<template>
    <div class="interaction-container">
        <div class="interaction-name"><label>{{ interactionName }}</label></div>
        <div class="interaction-options">
            <aButtonSelect 
                v-if="(interactionType === 'select' || interactionType === 'property-read' || interactionType === 'action-invoke' && !interactionSelectBtn.btnInputType.propType) || interactionType === 'property-observe-read'"
                class="interaction-select-btn"
                :btnLabel="interactionSelectBtn.btnLabel"
                :btnKey="interactionSelectBtn.btnKey"
                :btnGeneralStyle="interactionSelectBtn.btnGeneralStyle"
                :btnSelectedStyle="interactionSelectBtn.btnSelectedStyle"
                v-on:select="$emit('select')"
                v-on:deselect="$emit('deselect')"
            />

            <aInteractionInput
                v-else-if="interactionType === 'property-write' || interactionType === 'action-invoke' || interactionType === 'property-observe-write' && interactionSelectBtn.btnInputType.propType"
                :btnLabel="interactionSelectBtn.btnLabel"
                :btnKey="interactionSelectBtn.btnKey"
                :btnInputType="interactionSelectBtn.btnInputType"
                :btnGeneralStyle="interactionSelectBtn.btnGeneralStyle"
                :btnSelectedStyle="interactionSelectBtn.btnSelectedStyle"
                :element="element"
                v-on:select-with-input="selectWithInput"
                v-on:deselect="$emit('deselect')"
            />

        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aButtonSelect from '@/components/01_atoms/aButtonSelect.vue';
import aInteractionInput from '@/components/01_atoms/aInteractionInput.vue';

export default Vue.extend({
    name: 'mInteraction',
    components: {
        aDropdownButton,
        aInteractionInput,
        aButtonSelect
    },
    props: {
        interactionType: {
            type: String,
            required: true
        },
        interactionName: {
            type: String,
            required: true
        },
        interactionDropdownBtn: {
            type: Object,
            required: false
        },
        interactionSelectBtn: {
            type: Object,
            required: false
        },
        element: {
            required: false
        }
    },
    methods: {
        selectWithInput(element: any, inputValue: any, changeInput: boolean) {
            this.$emit('select-with-input', element, inputValue, changeInput);
        }
    }
});
</script>

<style scoped>
.interaction-container {
    display: flex;
    width: 100%;
    height: 35px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    margin: 5px 0 5px 0;
    background: #939C9E;
}

.interaction-name {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 7px;
}

.interaction-options {
    width: 50%;
}

.interaction-options :hover {
  background: #92afae;
}

.interaction-dropdown-btn {
    height: 100%;
}
</style>
