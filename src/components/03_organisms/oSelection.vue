<template>
    <div class="selection-container">
        <div class="selection-title"><label>Selection</label></div>
        <div class="selection-area" v-if="isValidTd">
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
                        v-on:select-with-input="addSelectedInteractionWithInput"
                        v-on:select="addSelectedInteraction(element)"
                        v-on:deselect="removeSelectedInteraction(element)"
                    />
                </div>
            </div>
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
                        v-on:select-with-input="addSelectedInteractionWithInput"
                        v-on:select="addSelectedInteraction(element)"
                        v-on:deselect="removeSelectedInteraction(element)"
                    />
                </div>
            </div>
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
                        v-on:select="addSelectedInteraction(element)"
                        v-on:deselect="removeSelectedInteraction(element)"
                    />
                </div>
            </div>
            <div class="selection-btn">
                <aBasicButton
                    class="selection-btn-invoke"
                    :btnClass="getSelectionBtn.btnClass"
                    :btnLabel="getSelectionBtn.btnLabel"
                    :btnOnClick="getSelectionBtn.btnOnClick"
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
        this.resetInteractions();
    },
    computed: {
       ...mapGetters('TdStore', ['getSelectionBtn', 'getTdParsed', 'getTdState', 'isValidTd'])
    },
    methods: {
        ...mapActions('TdStore', [
                'removeFromSelectedInteractions',
                'addToSelectedInteractions',
                'invokeInteractions',
                'resetInteractions']),

        async addSelectedInteraction(element: any) {
            const newInteractionList = await this.addToSelectedInteractions({ newInteraction: element});
        },
        async addSelectedInteractionWithInput(input: any, element: any) {
            element.interactionSelectBtn.input = input;
            const newInteractionList = await this.addToSelectedInteractions({ newInteraction: element});
        },
        async removeSelectedInteraction(element: any) {
            const newInteractionList = await this.removeFromSelectedInteractions({ interactionToRemove: element});
        }
    },
    watch: {
        '$route.params.id': function (id) {
            this.resetInteractions();
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
}

.selection-area-el {
    width: 100%;
    height: 33.33%;
    padding: 5px 7px 5px 7px;
    overflow: auto;
}

.selection-label-container{
    width: 100%;
    max-height: 20%;
}

.selection-btn {
    height: 12%;
    padding-top: 7px;
}

.selection-btn-invoke {
    width: 100%;
    padding: 5px;
}

.interaction-container-all {
    width: 100%;
    overflow: auto;
}
</style>