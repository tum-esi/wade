<template>
    <div class="performance-container"> 
        <oSelection class="performance-child-container"/>
        <oPerformanceSelection 
            :selectedInteractions="selectedInteractions" 
            class="performance-child-container"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oPerformanceSelection from '@/components/03_organisms/oPerformanceSelection.vue';

export default Vue.extend({
    name: 'tPerformance',
    components: {
        oSelection,
        oPerformanceSelection
    },
    data() {
        return {
            // TODO: just a mock, give real interactions later
            selectedInteractions: [
                { title: 'exampleInteraction' }
            ]
        };
    },
    created() {
    },
    beforeDestroy() {
    },
    computed: {
    },
    methods: {
        
    },
    watch: {
        '$route.params.id'(id) {
        }
    },
});
</script>

<style scoped>
.performance-container {
    height: 100%;
    width: 100%;
    display: flex;
}

.performance-child-container {
    width: 33.33%;
    padding: 0px 7px 7px 7px;
}

</style>