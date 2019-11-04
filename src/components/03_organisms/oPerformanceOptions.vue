<template>
    <div class="performance-selection-container"> 
        <div class="section-title">
            <label>{{ texts.title }}</label>
        </div>
        <div class="section-body">
            <!-- Measurement type selection -->
            <div class="sections-test-options">
                <label> {{ texts.titleOptions }}</label>
                <aSimpleDropdownButton 
                    v-on:get-selected-input="measurementType=$event"
                    :defaultOption="typeDefault"
                    :dropdownOptions="typeOptions"
                    :selectionAction="'get-selected-input'"
                />
            </div>
            <!--Measurement iterations -->
            <div v-if="measurementType === getEnumType('NUM_RUNS')">
                <label> {{ texts.iterationsTitle }}</label>
                <aSimpleInputField 
                    v-on:input-changed="iterations=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.iterationsPlaceholder"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </div>
            <!-- What interactions are selected -->
            <div class="selected-interaction">
                <label>
                    {{ selectedInteractionNames.length > 1 
                        ? texts.selectedInteractions 
                        : texts.selectedInteraction }}
                </label>
                <label>{{ selectedInteractionNames }}</label>
            </div>
            <!-- Delay type selection -->
            <div class="test-delay">
                <label> {{ texts.delayTitle }}</label>
                <aSimpleDropdownButton 
                    v-on:get-selected-input="typeOfDelay=$event"
                    :defaultOption="delayDefault"
                    :dropdownOptions="delayOptions"
                    :selectionAction="'get-selected-input'"
                />
            </div>
            <!-- Duration Delay -->
            <div v-if="typeOfDelay !== getEnumType('NO_DELAY')">
                <label> {{ `${texts.delayTitle} ${texts.durationTitle}` }}</label>
                <aSimpleInputField 
                    v-on:input-changed="delayDuration=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.delayDurationPlaceholder"
                    :inputOptions="{ min: 1, max: 100000 }"
                />
            </div>
            <!-- Measurment Duration -->
            <div v-if="measurementType === getEnumType('DURATION_RUN')">
                <label> {{ texts.durationTitle }}</label>
                <aSimpleInputField 
                    v-on:input-changed="duration=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.durationPlaceholder"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </div>
            <!-- Measure multiple times -->
            <div>
                <label> {{ texts.measurementNumTitle }}</label>
                <aSimpleInputField 
                    v-on:input-changed="measurementNum=$event"
                    :inputType="'number'"
                    :inputDefault="1"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </div>
        </div>
            <div class="section-button-container">
                <aButtonBasic 
                    class="section-button"
                    :btnLabel="texts.btnStart"
                    :btnClass="'btn-normal'"
                    :btnOnClick="'start-measurement'"
                    :btnActive="canStartMeasurement"
                    @start-measurement="startMeasurement"
                />
            </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { MeasurementTypeEnum, DelayTypeEnum } from '@/util/enums';
import aSimpleDropdownButton from '@/components/01_atoms/aSimpleDropdownButton.vue';
import aSimpleInputField from '@/components/01_atoms/aSimpleInputField.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
    name: 'oPerformanceOptions',
    components: {
        aSimpleDropdownButton,
        aSimpleInputField,
        aButtonBasic
    },
    props: {
        selectedInteractionNames: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            texts: this.$store.state.TextStore.performance.performanceOptions,
            iterations: undefined as number | undefined,
            duration: undefined as number | undefined,
            measurementNum: undefined as number | undefined,
            // Delay
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
            measurementType: undefined as MeasurementTypeEnum | undefined,
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
            ]
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getSelections']),
        canStartMeasurement(): boolean {
           return (this.measurementType !== undefined
            && ((this.iterations !== undefined && this.iterations > 0)
                || (this.duration !== undefined && this.duration > 0))
            && ((this as any).getSelections.length > 0));
        }
    },
    methods: {
        getEnumType(type: string) {
            return MeasurementTypeEnum[type]
                ? MeasurementTypeEnum[type]
                : (DelayTypeEnum[type] ? DelayTypeEnum[type] : undefined);
        },
        startMeasurement() {
            this.$emit('start-measurement', {
                measurementType: this.measurementType,
                iterations: this.iterations,
                duration: this.duration,
                delayFirst: this.typeOfDelay === DelayTypeEnum.BEFORE_BEGIN
                    ? this.delayDuration || undefined : undefined,
                delayBeforeEach: this.typeOfDelay === DelayTypeEnum.BEFORE_EACH
                    ? this.delayDuration || undefined : undefined,
                measurementNum: this.measurementNum
            });
        }
    }
});
</script>

<style scoped>
.performance-selection-container {
    height: 100%;
    font-size: 14px;
}

.section-title {
    padding: 7px 0px 7px 2px;
    height: 8%;
    display: flex;
    align-items: center;
}

.section-body {
    width: 100%;
    height: 84%;
    border: 1px solid #393B3A;
    border-radius: 3px;
    background: #B4BAB9;
}

.section-button-container {
    height: 8%;
    padding-top: 7px;
    width: 100%;
    display: flex;
}

.section-button {
    width: 100%;
    padding: 5px;
    margin: 0;
    font-size: 13px;
}

.sections-test-options {
    display: flex;
}
</style>