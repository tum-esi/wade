<template>
    <div class="performance-output-container"> 
        <div class="output-title">
            <label> {{ texts.title + resultStatus }}</label>
        </div>
        <div class="output-body">
            <div class="result" v-for="(element, index) in formattedData" :key="element + index">
                <br>
                Name: {{ element.name }}
                <br>
                Size: {{ element.size }}
                <br>
                Type: {{ element.type }}
                <br>
                Number Clients: {{ element.numClients }}
                <br>
                First Measured: {{ element.firstMeasured }}
                <br>
                Delay First: {{ element.delayFirst }}
                <br>
                Delay before each: {{ element.delayBeforeEach }}
                <br>
                Realistic: {{ element.realistic }}
                <br>
                Possible: {{ element.possible }}
                <br>
                Realistic Without First: {{ element.realisticWithoutFirst }}
                <br>
                Possible Without First: {{ element.possibleWithoutFirst }}
                <br>
                Measured Executions: {{ element.measuredExecutions }}
                <br>
                Iterations: {{ element.iterations }}
                <br>
                Duration: {{ element.duration }}
            </div>
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

export default Vue.extend({
    name: 'oPerformanceOutput',
    components: {
        aButtonBasic
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
            formattedData: [{
                name: undefined,
                size: undefined,
                type: undefined,
                numClients: undefined,
                firstMeasured: undefined,
                delayFirst: undefined,
                delayBeforeEach: undefined,
                realistic: undefined,
                possible: undefined,
                realisticWithoutFirst: undefined,
                possibleWithoutFirst: undefined,
                measuredExecutions: undefined,
                iterations: undefined,
                duration: undefined
            }] as any,
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