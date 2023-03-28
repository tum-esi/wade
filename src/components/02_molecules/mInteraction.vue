<template>
    <div class="interaction-container">
        <div class="interaction-name"><label>{{ interactionName }}</label></div>
        <div class="interaction-options">
            <aButtonSelect 
                v-if="(interactionType === 'select' || interactionType === 'property-read' || interactionType === 'property-read-all' || interactionType === 'property-read-multiple' || interactionType === 'action-invoke' && !interactionSelectBtn.btnInputType.propType) || interactionType === 'property-observe-read'"
                class="interaction-select-btn"
                :btnLabel="interactionSelectBtn.btnLabel"
                :btnKey="interactionSelectBtn.btnKey"
                :btnGeneralStyle="interactionSelectBtn.btnGeneralStyle"
                :btnSelectedStyle="interactionSelectBtn.btnSelectedStyle"
                :btnDisabled="showInteractionError"
                :interactionReadAll="interactionReadAll"
                v-on:select="$emit('select')"
                v-on:deselect="$emit('deselect')"
            />

            <aInteractionInput
                v-else-if="interactionType === 'property-write' || interactionType === 'action-invoke' || interactionType === 'property-observe-write' && interactionSelectBtn.btnInputType.propType"
                ref="interactionInput"
                :btnLabel="interactionSelectBtn.btnLabel"
                :btnKey="interactionSelectBtn.btnKey"
                :btnInputType="interactionSelectBtn.btnInputType"
                :btnInputSchema="interactionSelectBtn.btnInputSchema"
                :btnGeneralStyle="interactionSelectBtn.btnGeneralStyle"
                :btnSelectedStyle="interactionSelectBtn.btnSelectedStyle"
                :element="element"
                :interactionWriteAll="interactionWriteAll"
                v-on:select-with-input="selectWithInput"
                v-on:select-write-all="selectWithInputForWriteAll"
                v-on:deselect="$emit('deselect')"
                v-on:show-error-message="showErrorMessage"
                v-on:remove-error-message="removeErrorMessage"
            />

        </div>
        <div v-if="showInteractionError" class="interaction-popover">{{interactionErrorMessage}}</div>
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
    data() {
        return {
            showInteractionError: false,
            interactionErrorMessage: ''
        }
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
        },
        interactionReadAll: {
            type: Boolean,
            required: false
        },
        interactionWriteAll: {
            type: Boolean,
            required: false
        }
    },
    methods: {
        selectWithInput(element: any, inputValue: any, changeInput: boolean) {
            this.$emit('select-with-input', element, inputValue, changeInput);
        },
        selectWithInputForWriteAll(element: any, inputValue: any) {
            this.$emit('select-write-all', element, inputValue);
        },
        showErrorMessage(message) {
            this.interactionErrorMessage = message;
            this.showInteractionError = true;
        },
        removeErrorMessage() {
            this.interactionErrorMessage = '';
            this.showInteractionError = false;
        }
    }
});
</script>

<style scoped>
.interaction-container {
    position: relative;
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

.interaction-popover {
  position: absolute;
  top: 100%;
  left: 0;
  overflow-y: scroll;
  z-index: 1;
  width: 100%;
  height: 50px;
  border: 1px solid #393B3A;
  border-radius: 3px;
  padding: 10px;
  white-space: pre-wrap; 
  word-wrap: break-word;
  color: #393B3A;
  background-color: #A36A5B;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
