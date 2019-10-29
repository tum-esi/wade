<template>
    <div class="performance-output-container"> 
        <div class="status-container">
            Status: {{ resultStatus }}
        </div>
        <div class="results-container">
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
        <aButtonBasic 
            :btnLabel="texts.btnSaveComputer"
            :btnClass="'btn-normal'"
            :btnOnClick="'save-measurements'"
            :btnActive="measurementWasComputed"
            @save-measurements="$emit('save-measurements', formattedData)"
        />
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
            texts: {
                btnSaveComputer: 'Save Performance Measurement to computer',
            },
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

</style>