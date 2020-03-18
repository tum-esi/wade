<template>
    <div class="ouput-element-container dropdown-container">
        <div @click="showOutputBody = !showOutputBody" class="ouput-el-title">
            <label class="title">{{ name }}</label>
            <div class="dropdown-icon">
                <img :src="showOutputBody ? arrowDownPath : arrowRightPath">
            </div>
        </div>
        <!-- Expendable body of output element -->
        <div v-if="showOutputBody" class="output-el-body">
            <!-- All measurements with number of iteration -->
            <div class="measurements dropdown-container">
                <label @click="showAllMeasurements = !showAllMeasurements" >Show all measurements</label>
                <div v-if="showAllMeasurements" class="all-measurements-elements">
                    <aOptionElement 
                        class="option-element"
                        v-for="(element,index) in allMeasurements"
                        :key="element + index"
                        :firstElement="`${index}) ${element} ms`"
                    />
                </div>
            </div>
            <!-- Actual results (e.g. WCET, BCET...) -->
            <div class="results dropdown-container">
                <label @click="showResults = !showResults">Show results</label>
                <div v-if="showResults" class="result-elements">
                    <!-- Realistic measurements: outliers have been removed (hopefully) -->
                    <div @click="showRealistic = !showRealistic">
                        <aOptionElement 
                            class="option-element"
                            v-if="!showRealistic && results.realistic"
                            :firstElement="texts.outputResultRealistic"
                            :icon="'arrow_right'"
                        />
                        <mComplexOptionElement
                            class="option-element"                  
                            v-if="results.realistic && showRealistic"
                            :title="texts.outputResultRealistic"
                            :optionElementObj="getOptionElements(results.realistic)"
                        />
                    </div>
                    <!-- Possible measurements: all measurements are beeing considered-->
                    <div @click="showPossible = !showPossible">
                        <aOptionElement 
                            class="option-element"
                            v-if="!showPossible && results.possible"
                            :firstElement="texts.outputResultPossible"
                            :icon="'arrow_right'"
                        />
                        <mComplexOptionElement
                            class="option-element"                  
                            v-if="results.possible && showPossible"
                            :title="texts.outputResultPossible"
                            :optionElementObj="getOptionElements(results.possible)"
                        />
                    </div>
                    <!-- Size of input send with request (if available)
                    <aOptionElement 
                        class="option-element"
                        v-if="results.size"
                        :firstElement="texts.outputResultSize"
                        :secondElement="results.size"
                    /> -->
                    <!-- First measured timing -->
                    <aOptionElement 
                        class="option-element"
                        v-if="results.firstMeasured"
                        :firstElement="texts.outputResultFirstMeasured"
                        :secondElement="results.firstMeasured"
                    />
                </div>
            </div>
            <!-- Presetted options - these are not changed by the measurement itself. They are just displayed and saved for overview purposes -->
            <div class="presets dropdown-container">
                <label @click="showPresets = !showPresets">Show settings</label>
                <div v-if="showPresets" class="presets-elements">
                    <!-- Overall iterations (all) conducted -->
                    <aOptionElement 
                        class="option-element"
                        v-if="results.overallIteration"
                        :firstElement="texts.outputResultoverallIteration"
                        :secondElement="results.overallIteration"
                    />
                    <!-- Overall duration needed for all measurements-->
                    <aOptionElement 
                        class="option-element"
                        v-if="results.overallDuration"
                        :firstElement="texts.outputResultoverallDuration"
                        :secondElement="results.overallDuration + ' ms'"
                    />
                    <!-- Type of measurement -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingType"
                        :secondElement="settings.type"
                    />
                    <!-- If type === iterations, show num iterations -->
                    <aOptionElement 
                        class="option-element"
                        v-if="settings.iterations"
                        :firstElement="texts.outputSettingIterations"
                        :secondElement="settings.iterations"
                    />
                    <!-- If type === duration, show ms duration -->
                    <aOptionElement 
                        class="option-element"
                        v-if="settings.duration"
                        :firstElement="`${texts.outputSettingDuration} ms`"
                        :secondElement="settings.duration"
                    />
                    <!-- (If delay type was selected) Type of delay -->
                    <aOptionElement 
                        class="option-element"
                        v-if="settings.delayType !== noDelay"
                        :firstElement="texts.outputSettingDelay"
                        :secondElement="settings.delayType"
                    />
                    <!-- (If delay type was selected) Duration of delay  -->
                    <aOptionElement 
                        class="option-element"
                        v-if="settings.delayType !== noDelay"
                        :firstElement="texts.outputSettingDelayDuration"
                        :secondElement="settings.delayDuration"
                    />
                    <!-- Input Size -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingsInputSize"
                        :secondElement="results.input.size"
                    />
                    <!-- Input Value -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingsInputValue"
                        :secondElement="results.input.value"
                    />
                    <!-- Output Size -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingsOutputSize"
                        :secondElement="results.output[0].size"
                    />
                    <!-- Output Value -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingsOutputValue"
                        :secondElement="results.output[0].value"
                    />
                    <!-- Output Value -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingsOutputAmount"
                        :secondElement="results.output[0].amount"
                    />

                    <!-- Number of measurements -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingNumMeasurements"
                        :secondElement="settings.numMeasurements"
                    />
                    <!-- Number of clients -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingClient"
                        :secondElement="settings.numClients"
                    />
                    <!-- Confidence level -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingConfLevel"
                        :secondElement="settings.confidenceLevel"
                    />
                    <!-- Confidence factor -->
                    <aOptionElement 
                        class="option-element"
                        :firstElement="texts.outputSettingConfFactor"
                        :secondElement="getConfLevel(settings.confidenceLevel)"
                    />
                </div>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aOptionElement from '@/components/01_atoms/aOptionElement.vue';
import mComplexOptionElement from '@/components/02_molecules/mComplexOptionElement.vue';
import { DelayTypeEnum } from '@/util/enums';
import { ConfLevel } from '@/util/helpers';

export default Vue.extend({
    name: 'mPerformanceOutputElement',
    components: {
        aOptionElement,
        mComplexOptionElement
    },
    props: {
        /**
         * Title of interaction
         */
       name: {
           required: true
       },
       /**
        * All measured times (redundant, also part of 'results' property, but shown extra for UI purposes)
        */
       allMeasurements: {
           required: true
       },
       /**
        * Settings of performance prediction.
        * <{ type: WADE.MeasurementTypeEnum,
        *   confidenceLevel: number,
        *   iterations?: number,
        *   duration?:number,
        *   delayType: WADE.DelayTypeEnum,
        *   delayDuration?: number,
        *   numMeasurements: number
        * }>
        */
       settings: {
           required: true
       },
        /**
         * Actual prediction measurements
         * <{
         * size: number,
         * firstMeasured: number,
         * realistic: number[],
         * possible: number[],
         * realisticWithoutFirst: number[],
         * possibleWithoutFirst: number[],
         * overallIteration: number,
         * overallDuration: number
         * }>
         */
        results: {
            required: true
        }
    },
    data() {
        return {
            texts: this.$store.state.TextStore.performance.performanceOutput,
            showOutputBody: false,
            showAllMeasurements: false,
            showPresets: false,
            showResults: false,
            showRealistic: false,
            showPossible: false,
            showRealisticWOFirst: false,
            showPossibleWOFirst: false,
            noDelay: DelayTypeEnum.NO_DELAY,
            arrowDownPath: require('@/assets/arrow_down.png'),
            arrowRightPath: require('@/assets/arrow_right.png'),
        };
    },
    methods: {
        /**
         * Require desired img
         */
        getIcon(path: string) {
           return require(`@/assets/${path}.png`);
        },
        getConfLevel(confidenceLevel: any) {
            return ConfLevel.get(confidenceLevel);
        },
        /**
         * Return formatted list for view of options
         */
        getOptionElements(obj) {
            return [
                { firstElement: 'WCET', secondElement: obj.WCET },
                { firstElement: 'BCET', secondElement: obj.BCET },
                { firstElement: 'AET', secondElement: obj.AET },
                { firstElement: 'All', secondElement: obj.all },
                { firstElement: 'CI Min', secondElement: obj.confidenceResults.confMin },
                { firstElement: 'CI Max', secondElement: obj.confidenceResults.confMax },
            ];
        }

    }
});
</script>

<style scoped>
.ouput-element-container {
    width: 100%;
    padding: 0 5px 0 5px;
    margin-bottom: 5px;
    background-color: #939C9E;
}

.output-el-body {
    width: 100%;
}

.ouput-el-title {
    display: flex;
    width: 100%;
    height: 35px;
}
.title {
    width: 90%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 4px;
    overflow: hidden;
}

.dropdown-icon {
    height: 100%;
}

.dropdown-icon img{
    max-height: 100%;
    object-fit: contain;
    max-width: 100%;
    padding: 5px;
}

.dropdown-container {
    border: 1px solid #393B3A;
    border-radius: 3px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
}

.dropdown-container label{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 5px;
    overflow: hidden;
    height: 35px;
}

.option-element {
    background-color: #939C9E;
}

.all-measurements-elements, .result-elements, .presets-elements {
    width: 100%;
    padding: 0 5px 0 5px;
}

.results, .presets, .measurements {
    margin-bottom: 5px;
    background-color: #b4bab9;
}

</style>
