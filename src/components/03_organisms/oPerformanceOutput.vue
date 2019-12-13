<template>
    <div class="performance-output-container"> 
        <div class="output-title">
            <label> {{ texts.title }}</label>
        </div>
        <div class="output-body">
            <mPerformanceOutputElement 
                v-for="(element, index) in formattedData"
                :key="element + index"
                :name="element.name"
                :settings="{
                    type: element.settingsMeasurementType,
                    iterations: element.settingsIteration,
                    duration: element.settingsDuration,
                    delayType: element.settingsDelayType,
                    delayDuration: element.settingsDelayDuration,
                    numMeasurements: element.settingsNumMeasurements,
                    numClients: element.settingsNumClients
                }"
                :results="{
                    size: element.size,
                    firstMeasured: element.firstMeasured,
                    realistic: element.realistic,    
                    possible: element.possible,
                    realisticWithoutFirst: element.realisticWithoutFirst,
                    possibleWithoutFirst: element.possibleWithoutFirst,
                    overallIteration: element.iterations,
                    overallDuration: element.measuredDuration
                }"
                :allMeasurements="element.measuredExecutions"
            />
        </div>
        <div class="output-button-container">
            <aButtonBasic 
                class="output-button"
                :btnLabel="texts.btnSaveComputer"
                :btnClass="'btn-normal'"
                :btnOnClick="'save-measurements'"
                :btnActive="measurementWasComputed"
                @save-measurements="$emit('save-measurements', formattedData)"
            />
            <aButtonBasic 
                class="output-button"
                :btnLabel="texts.btnAnnotateTD"
                :btnClass="'btn-normal'"
                :btnOnClick="'save-measurements'"
                :btnActive="measurementWasComputed"
                @save-measurements="$emit('save-measurements', formattedData)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { StatusEnum } from '@/util/enums';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import mPerformanceOutputElement from '@/components/02_molecules/mPerformanceOutputElement.vue';

export default Vue.extend({
    name: 'oPerformanceOutput',
    components: {
        aButtonBasic,
        mPerformanceOutputElement
    },
    props: {
        /**
         * Can be anything from type StatusEnum
         */
        resultStatus: {
            type: String,
            required: true
        },
        /**
         * Promise of type WADE.PerformanceResult[]
         */
        resultData: {
            type: Promise,
            required: false
        }
    },
    data() {
        return {
            measurementWasComputed: false,
            texts: this.$store.state.TextStore.performance.performanceOutput,
            formattedData: [] as any[]
        };
    },
    watch: {
         async resultData() {
            this.formattedData = await (this as any).resultData.then((res) => {
                 return res;
            });
            (this as any).measurementWasComputed = true;
        }
    }
});
</script>

<style scoped>
.performance-output-container {
    height: 100%;
    font-size: 14px;
}

.output-title {
    padding: 7px 0px 7px 2px;
    height: 8%;
    display: flex;
    align-items: center;
}

.output-body {
    width: 100%;
    height: 84%;
    border: 1px solid #393B3A;
    border-radius: 3px;
    background: #B4BAB9;
    padding: 7px 7px 0 7px;
    overflow: scroll;
}

.output-button-container {
    height: 8%;
    padding-top: 7px;
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.output-button {
    width: 49%;
    padding: 5px;
    margin: 0;
    font-size: 13px;
}
</style>