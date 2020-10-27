<template>
    <div id="selection-area-container">
        <aTemplateSelectionMaGe
        :title="'Subscription-driven'"
        :imgSrc="'event-template'"
        v-model="template['use-event-template']"
        @input="$emit('change', template)"
        class="template-selection"
        >
            <template v-slot:desription>
                The interaction sequence starts when the mashup agent receives an event. 
                The data from the event is then sent to the matching outputs as input for an action or as a property write.
            </template>
        </aTemplateSelectionMaGe>

        <aTemplateSelectionMaGe
        :title="'Read-driven'"
        :imgSrc="'read-template'"
        v-model="template['use-read-template']"
        @input="$emit('change', template)"
        class="template-selection"
        >
            <template v-slot:desription>
                The interaction sequence starts with the mashup agent reading a property from an input device. 
                The data is then sent to the matching outputs as input for an action or as a property write.
            </template>
        </aTemplateSelectionMaGe>

        <aTemplateSelectionMaGe
        :title="'Action-driven'"
        :imgSrc="'action-template'"
        v-model="template['use-action-template']"
        @input="$emit('change', template)"
        class="template-selection"
        >
            <template v-slot:desription>
                The interaction sequence starts with the mashup agent invoking an action that has an output from an input device. 
                The received data is then sent to the matching outputs as input for an action or as a property write.
            </template>    
        </aTemplateSelectionMaGe>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aTemplateSelectionMaGe from '@/components/01_atoms/aTemplateSelectionMaGe.vue'
export default Vue.extend({
    name: 'mTemplateSelectionAreaMaGe',
    components: {
        aTemplateSelectionMaGe
    },
    model: {
        prop: 'template',
        event: 'change'
    },
    props: {
        template: {
            type: Object as () => {
            "use-event-template": Boolean,
            "use-action-template": Boolean,
            "use-read-template": Boolean,
            },
            required: true
        }
    }
})
</script>

<style lang="less" scoped>
    #selection-area-container {
        display: flex;
        flex-flow: row nowrap;
    }

    .template-selection {
        width: 32%;
        height: 100%;
    }
</style>