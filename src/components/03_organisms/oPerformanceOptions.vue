<template>
    <div class="performance-selection-container"> 
        <div class="section-title">
            <label>{{ texts.title }}</label>
        </div>
        <div class="section-body">
            <!-- Measurement type selection -->
            <aPerformanceOption :optionLabel="texts.titleOptions" >
                <aSimpleDropdownButton 
                    class="option-input"
                    v-on:get-selected-input="measurementType=$event"
                    :defaultOption="typeDefault"
                    :dropdownOptions="typeOptions"
                    :selectionAction="'get-selected-input'"
                    :optionalIconPaths="{iconPathDropdownClosed: 'arrow_down', iconPathDropdownActive: 'arrow_right'}"
                />
            </aPerformanceOption>
            <!--Measurement iterations -->
            <aPerformanceOption 
                v-if="measurementType === getEnumType('NUM_RUNS')" 
                :optionLabel="texts.iterationsTitle"
            >
                <aSimpleInputField
                    class="option-input"
                    v-on:input-changed="iterations=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.iterationsPlaceholder"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </aPerformanceOption>
            <!-- Measurment Duration -->
            <aPerformanceOption 
                v-if="measurementType === getEnumType('DURATION_RUN')" 
                :optionLabel="texts.durationTitle"
            >
                <aSimpleInputField
                    class="option-input"
                    v-on:input-changed="duration=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.durationPlaceholder"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </aPerformanceOption>
            <!-- Delay type selection -->
            <aPerformanceOption :optionLabel="texts.delayTitle" >
                <aSimpleDropdownButton 
                    class="option-input"
                    v-on:get-selected-input="typeOfDelay=$event"
                    :defaultOption="delayDefault"
                    :dropdownOptions="delayOptions"
                    :selectionAction="'get-selected-input'"
                    :optionalIconPaths="{iconPathDropdownClosed: 'arrow_down', iconPathDropdownActive: 'arrow_right'}"
                />
            </aPerformanceOption>
            <!-- Duration Delay -->
            <aPerformanceOption 
                :optionLabel="texts.delayDurationTitle"
                :class="{'disabled': typeOfDelay === getEnumType('NO_DELAY')}"
            >
                <aSimpleInputField
                    class="option-input"
                    v-on:input-changed="delayDuration=$event"
                    :inputType="'number'"
                    :inputPlaceholder="texts.delayDurationPlaceholder"
                    :inputOptions="{ min: 1000, max: 5000 }"
                    :disabled="typeOfDelay === getEnumType('NO_DELAY')"
                />
            </aPerformanceOption>
            <!-- Measure multiple times -->
            <aPerformanceOption :optionLabel="texts.measurementNumTitle">
                <aSimpleInputField
                    class="option-input"
                    v-on:input-changed="measurementNum=$event"
                    :inputType="'number'"
                    :inputDefault="1"
                    :inputOptions="{ min: 1, max: 10 }"
                />
            </aPerformanceOption>
            <!-- Select confidence interval -->
            <aPerformanceOption :optionLabel="texts.confidenceTitle">
                <aSimpleDropdownButton 
                    class="option-input"
                    v-on:get-selected-input="selectedConfLevel=$event"
                    :defaultOption="confLevelDefault"
                    :dropdownOptions="confLevelOptions"
                    :selectionAction="'get-selected-input'"
                    :optionalIconPaths="{iconPathDropdownClosed: 'arrow_down', iconPathDropdownActive: 'arrow_right'}"
                />
            </aPerformanceOption>
             <!-- Select Static Timing -->
            <aPerformanceOption 
                :optionLabel="texts.calculateStatic"
                :class="{'disabled': typeOfDelay === getEnumType('NO_DELAY')}"
            >
                <aSimpleDropdownButton 
                    class="option-input"
                    v-on:get-selected-input="selectedStatic=$event"
                    :defaultOption="staticDefault"
                    :dropdownOptions="staticOptions"
                    :selectionAction="'get-selected-input'"
                    :optionalIconPaths="{iconPathDropdownClosed: 'arrow_down', iconPathDropdownActive: 'arrow_right'}"
                />
            </aPerformanceOption>
            <!-- Selected interactions -->
            <div class="selected-interaction">
                <label>
                    {{ selectedInteractionNames.length > 1 
                        ? texts.selectedInteractions 
                        : texts.selectedInteraction }}
                </label>
                <aOptionElement 
                    v-for="(element, index) in selectedInteractionNames"
                    :key="element + index"
                    :firstElement="element"
                    class="darkgreen"
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
import { confidenceLevel } from '@/util/helpers';
import aSimpleDropdownButton from '@/components/01_atoms/aSimpleDropdownButton.vue';
import aSimpleInputField from '@/components/01_atoms/aSimpleInputField.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aPerformanceOption from '@/components/01_atoms/aPerformanceOption.vue';
import aOptionElement from '@/components/01_atoms/aOptionElement.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
    name: 'oPerformanceOptions',
    components: {
        aSimpleDropdownButton,
        aSimpleInputField,
        aButtonBasic,
        aPerformanceOption,
        aOptionElement
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
            staticDefault: '',
            selectedStatic: '',
            staticOptions: [
                {
                    title: 'Calculate',
                    style: 'border-bottom full-width'
                },
                {
                    title: '',
                    style: 'border-bottom full-width'
                },
            ],
            selectedConfLevel: confidenceLevel.NINETY_NINE_PERCENT[0] as any,
            confLevelDefault: confidenceLevel.NINETY_NINE_PERCENT[0],
            confLevelOptions: [
                {
                    title: confidenceLevel.EIGHTY_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.EIGHTY_FIVE_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.NINETY_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.NINETY_FIVE_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.NINETY_NINE_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.NINETY_NINE_POINT_FIVE_PERCENT[0],
                    style: 'border-bottom full-width'
                },
                {
                    title: confidenceLevel.NINETY_NINE_POINT_NINE_PERCENT[0],
                    style: 'full-width'
                }
            ],
            iterations: undefined as number | undefined,
            duration: undefined as number | undefined,
            measurementNum: 1 as number,
            // Delay
            typeOfDelay:  DelayTypeEnum.NO_DELAY as DelayTypeEnum,
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
            measurementType: MeasurementTypeEnum.NUM_RUNS as MeasurementTypeEnum,
            typeDefault: MeasurementTypeEnum.NUM_RUNS,
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
            const settings: WADE.PerformanceMeasurementSettings = {
                settingsMeasurementType: this.measurementType,
                settingsConfidenceLevel: this.selectedConfLevel,
                settingsIterations: this.iterations,
                settingsDuration: this.duration,
                settingsDelayType: this.typeOfDelay,
                settingsDelayDuration: this.delayDuration,
                settingsNumMeasurements: this.measurementNum,
                settingsNumClients: 1 // TODO: for later
            };

            this.$emit('start-measurement', settings);

            // this.$emit('start-measurement', {
            //     measurementType: this.measurementType,
            //     iterations: this.iterations,
            //     duration: this.duration,
            //     delayFirst: this.typeOfDelay === DelayTypeEnum.BEFORE_BEGIN
            //         ? this.delayDuration || undefined : undefined,
            //     delayBeforeEach: this.typeOfDelay === DelayTypeEnum.BEFORE_EACH
            //         ? this.delayDuration || undefined : undefined,
            //     measurementNum: this.measurementNum
            // });
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
    padding: 2px 7px 0px 7px;
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

.option-input {
    width: 50%;
}

.selected-interaction {
    padding-top: 7px;
    border-top: 2px solid #393B3A;
}
</style>