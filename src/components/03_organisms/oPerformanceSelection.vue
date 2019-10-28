<template>
    <div class="performance-selection-container"> 
        <div class="section-title">
            <label>{{ texts.title }}</label>
        </div>
        <!-- What interactions are selected -->
        <div class="selected-interaction">
            <label>
                {{ selectedInteractions.length > 1 
                    ?  texts.selectedInteractions 
                    : texts.selectedInteraction }}
            </label>
            <label>{{ selectedInteractions }}</label>
        </div>
        <!-- User can add a delay -->
        <div class="test-delay">
            <label> {{ texts.delayTitle }}</label>
            <aSimpleDropdownButton 
                v-on:get-selected-input="typeOfDelay=$event"
                :defaultOption="delayDefault"
                :dropdownOptions="delayOptions"
                :selectionAction="'get-selected-input'"
            />
        </div>
        <!-- Duration of delay -->
        <div v-if="typeOfDelay !== getEnumType('NO_DELAY')">
            <label> {{ `${texts.delayTitle} ${texts.durationTitle}` }}</label>
            <aSimpleInputField 
                v-on:input-changed="delayDuration=$event"
                :inputType="'number'"
                :inputPlaceholder="texts.delayDurationPlaceholder"
                :inputOptions="{ min: 1, max: 100000 }"
            />
        </div>
        <!-- What type of test should be run -->
        <div class="sections-test-options">
            <label> {{ texts.titleOptions }}</label>
            <aSimpleDropdownButton 
                v-on:get-selected-input="typeOfTest=$event"
                :defaultOption="typeDefault"
                :dropdownOptions="typeOptions"
                :selectionAction="'get-selected-input'"
            />
        </div>
        <!-- If selected test type is iteration -->
        <div v-if="typeOfTest === getEnumType('NUM_RUNS')">
            <label> {{ texts.iterationTitle }}</label>
            <aSimpleInputField 
                v-on:input-changed="iteration=$event"
                :inputType="'number'"
                :inputPlaceholder="texts.iterationPlaceholder"
                :inputOptions="{ min: 1, max: 10 }"
            />
        </div>
        <!-- If selected test type is duration -->
        <div v-if="typeOfTest === getEnumType('DURATION_RUN')">
            <label> {{ texts.durationTitle }}</label>
            <aSimpleInputField 
                v-on:input-changed="duration=$event"
                :inputType="'number'"
                :inputPlaceholder="texts.durationPlaceholder"
                :inputOptions="{ min: 1, max: 10 }"
            />
        </div>
        <aButtonBasic 
            :btnLabel="texts.btnStart"
            :btnClass="'btn-normal'"
            :btnOnClick="'start-measurement'"
            :btnActive="canStartMeasurement"
            @start-measurement="startMeasurement"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { MeasurementTypeEnum, DelayTypeEnum } from '@/util/enums';
import aSimpleDropdownButton from '@/components/01_atoms/aSimpleDropdownButton.vue';
import aSimpleInputField from '@/components/01_atoms/aSimpleInputField.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';

export default Vue.extend({
    name: 'oPerformanceSelection',
    components: {
        aSimpleDropdownButton,
        aSimpleInputField,
        aButtonBasic
    },
    props: {
        selectedInteractions: {
            type: Array || Object,
            required: true
        }
    },
    data() {
        return {
            iteration: undefined as number | undefined,
            duration: undefined as number | undefined,

            typeOfDelay:  undefined as DelayTypeEnum | undefined,
            delayDefault: DelayTypeEnum.NO_DELAY,
            delayDuration: 0 as number,
            delayOptions: [
                {
                    title: DelayTypeEnum.NO_DELAY,
                    style: 'border-bottom full-width'
                },
                {
                    title: DelayTypeEnum.BEFORE_EACH,
                    style: 'border-bottom full-width'
                },
                {
                    title: DelayTypeEnum.BEFORE_BEGIN,
                    style: 'full-width'
                }
            ],
            // TODO: get presets / options from store

            typeOfTest: undefined as MeasurementTypeEnum | undefined,
            typeDefault: 'Select a measurement type',
            typeOptions: [
                {
                    title: MeasurementTypeEnum.NUM_RUNS,
                    style: 'border-bottom full-width'
                },
                {
                    title: MeasurementTypeEnum.DURATION_RUN,
                    style: 'full-width'
                }
            ],
            texts: {
                title: 'Performance Measurements Options:',
                titleOptions: 'Type:',
                selectedInteraction: 'Selected Interaction:',
                selectedInteractions: 'Selected Interactions:',
                delayTitle: 'Delay:',
                delayDurationPlaceholder: 'Delay in ms',
                durationTitle: 'Duration:',
                durationPlaceholder: 'Duration in ms',
                iterationTitle: 'Iteration:',
                iterationPlaceholder: 'Number of iterations',
                errorNoTypeSelected: 'Please select a measurement option.',
                btnStart: 'Start measurements'
            }
        };
    },
    computed: {
        canStartMeasurement(): boolean {
           return (this.typeOfTest !== undefined
            && ((this.iteration !== undefined && this.iteration > 0)
            || (this.duration !== undefined && this.duration > 0)));
        }
    },
    methods: {
        getEnumType(type: string) {
            return MeasurementTypeEnum[type]
                ? MeasurementTypeEnum[type]
                : (DelayTypeEnum[type] ? DelayTypeEnum[type] : undefined);
        },
        startMeasurement() {
        }
    }
});
</script>

<style scoped>
.performance-selection-container {

}
.sections-test-options {
    display: flex;
}
</style>