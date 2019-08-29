<template>
    <div class="selection-container">
        <div class="selection-title"><label>Selection</label></div>
        <div class="selection-area" v-if="isValidTd">
            <!-- Properties -->
            <div class="properties border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Properties</label></div>
                <div class="interaction-container-all">
                    <mInteraction 
                        v-for="(element, index) in 
                        getTdParsed.propertyInteractions"
                        :interactionType="element.interactionType"
                        :key="index"
                        :element="element"
                        :interactionName="element.interactionName"
                        :interactionSelectBtn="element.interactionSelectBtn"
                        v-on:select-with-input="select"
                        v-on:select="select(element)"
                        v-on:deselect="reset(element)"
                    />
                </div>
            </div>
            <!-- Actions -->
            <div class="actions border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Actions</label></div>
                <div class="interaction-container-all">
                    <mInteraction 
                        v-for="(element, index) in getTdParsed.actionInteractions"
                        :interactionType="element.interactionType"
                        :key="index"
                        :element="element"
                        :interactionName="element.interactionName"
                        :interactionSelectBtn="element.interactionSelectBtn"
                        v-on:select-with-input="select"
                        v-on:select="select(element)"
                        v-on:deselect="reset(element)"
                    />
                </div>
            </div>
            <!-- Events -->
            <div class="events selection-area-el">
                <div class="selection-label-container border-bottom"><label>Events</label></div>
                <div class="interaction-container-all">
                    <mInteraction 
                        class="interaction"
                        v-for="(element, index) in getTdParsed.eventInteractions"
                        :interactionType="'select'"
                        :key="index"
                        :interactionName="element.interactionName"
                        :interactionSelectBtn="element.interactionSelectBtn"
                        v-on:select="select(element)"
                        v-on:deselect="reset(element)"
                    />
                </div>
            </div>
            <div class="selection-btn">
                <aBasicButton 
                    class="selection-btn-reset"
                    :btnClass="getSelectionResetBtn.btnClass"
                    :btnLabel="getSelectionResetBtn.btnLabel"
                    :btnOnClick="getSelectionResetBtn.btnOnClick"
                    :btnActive="isBtnActive"
                    v-on:reset-selections="resetAll"
                />
                <aBasicButton
                    class="selection-btn-invoke"
                    :btnClass="getSelectionBtn.btnClass"
                    :btnLabel="getSelectionBtn.btnLabel"
                    :btnOnClick="getSelectionBtn.btnOnClick"
                    :btnActive="isBtnActive"
                    v-on:invoke-interactions="invokeInteractions"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import { InteractionStateEnum, TdStateEnum } from '@/util/enums';
import aBasicButton from '@/components/01_atoms/aButtonBasic.vue';
import mInteraction from '@/components/02_molecules/mInteraction.vue';

export default Vue.extend({
    name: 'oSelection',
    components: {
        aBasicButton,
        mInteraction
    },
    beforeDestroy() {
        (this as any).resetInteractions();
    },
    computed: {
       ...mapGetters('TdStore', [
           'getSelectionBtn',
           'getSelectionResetBtn',
           'getInteractionState',
           'getTdParsed',
           'getTdState',
           'isValidTd']),
        isBtnActive() {
            return (this as any).getInteractionState ===         InteractionStateEnum.NOT_INVOKED
            || (this as any).getInteractionState === InteractionStateEnum.INVOKED;
        }
    },
    methods: {
        ...mapActions('TdStore', [
                'removeFromSelectedInteractions',
                'addToSelectedInteractions',
                'invokeInteractions',
                'resetInteractions',
                'resetSelections']),
        // Add clicked interaction to selected interactions.
        // element: { interactionName, interactionSelectBtn, interactionType }
        async select(element, input?) {
            if (input || typeof input === 'boolean') {
                element.interactionSelectBtn.input = input;
            }
            const newInteractionList = await (this as any).addToSelectedInteractions({ newInteraction: element});
        },
        // Remove clicked interaction of selected interactions.
        // element: { interactionName, interactionSelectBtn, interactionType }
        async reset(element) {
            await (this as any).removeFromSelectedInteractions({ interactionToRemove: element});
        },
        // Remove all interactions from selected interacitons.
        async resetAll() {
            (this as any).resetSelections();
            // TODO: this.$eventHub.$emit('selections-reseted');
        }
    },
    watch: {
        '$route.params.id'(id) {
            (this as any).resetAll();
        }
    }
});
</script>

<style scoped>
.selection-container {
    height: 100%;
    font-size: 14px;
}

.selection-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}

.selection-area {
    width: 100%;
    height: 80%;
    border: 1px solid #393B3A;
    border-radius: 3px;
    background: #B4BAB9;
}

.selection-area-el {
    width: 100%;
    height: 33.33%;
    padding: 5px 7px 0px 7px;
}

.selection-label-container{
    width: 100%;
    height: 20%;
}

.selection-btn {
    height: 12%;
    padding-top: 7px;
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.selection-btn-invoke, .selection-btn-reset {
    width: 49%;
    padding: 5px;
    margin: 0;
}

.interaction-container-all {
    width: 100%;
    overflow: auto;
    height: 80%;
}
</style>