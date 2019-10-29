<template>
    <div class="performance-output-container"> 
            Status: {{ resultStatus }}
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
</template>

<script lang="ts">
import Vue from 'vue';
import { StatusEnum } from '@/util/enums';

export default Vue.extend({
    name: 'oPerformanceOutput',
    components: {
    },
    props: {
        /**
         * Can be anything from type StatusEnum
         */
        resultStatus: {
            type: String,
            required: true
        },
        resultData: {
            // type: Array as () => WADE.PerformanceResult[],
            type: Promise,
            required: false
        }
    },
    data() {
        return {
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
    computed: {
    },
    watch: {
         async resultData() {
            this.formattedData = await (this as any).resultData.then((res) => {
                return res;
            });
        }
    }
});
</script>

<style scoped>

</style>