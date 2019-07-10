<template>
    <div class="results-container">
        <div class="results-title"><label>Results</label></div>
        <div v-if="interactionsInvoked" class="results-area">

            <div class="properties border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Result Properties</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultProps"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                    />
                </div>
            </div>

            <div class="actions border-bottom-bold selection-area-el">
                <div class="selection-label-container border-bottom"><label>Actions</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultActions"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                    />
                </div>
            </div>

            <div class="events selection-area-el">
                <div class="selection-label-container border-bottom"><label>Events</label></div>
                <div class="interaction-container-all">
                    <aResultElement
                        v-for="(element, index) in getResultEvents"
                        :key=index
                        :resultType="element.resultType"
                        :resultTitle="element.resultTitle"
                        :resultValue="element.resultValue"
                    />
                </div>
            </div>

        </div>
        <div v-if="!interactionsInvoked" class="results-btn">
            <aBasicButton
                class="results-btn-show"
                :btnClass="getResultsBtn.btnClass"
                :btnLabel="getResultsBtn.btnLabel"
                :btnOnClick="getResultsBtn.btnOnClick"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import aBasicButton from '@/components/01_atoms/aButtonBasic.vue';
import aResultElement from '@/components/01_atoms/aResultElement.vue';

export default Vue.extend({
    name: 'oResults',
    components: {
        aBasicButton,
        aResultElement
    },
    beforeDestroy() {
        this.resetResults();
    },
    data() {
        return {
            interactionsInvoked: true
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getResultsBtn', 'getResultProps', 'getResultActions', 'getResultEvents']),
    },
    methods: {
        ...mapActions('TdStore', ['resetResults'])
    },
    watch: {
    '$route.params.id': function (id) {
        this.resetResults();
    }
    },
});
</script>

<style scoped>
.results-container {
    height: 100%;
    font-size: 14px;
}

.results-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}

.results-area {
    width: 100%;
    height: 80%;
    border: 1px solid #393B3A;
    border-radius: 3px;
}

.selection-area-el {
    width: 100%;
    height: 33.33%;
    padding: 5px 7px 5px 7px;
    overflow: scroll;
}

.selection-label-container {
    max-height: 20px;
}

.interaction-container-all {
    width: 100%;
    overflow: scroll;
}

.results-btn {
    height: 12%;
    padding-top: 7px;
}

.results-btn-show {
    width: 100%;
    height: 100%;
    padding: 5px;
}

.results-btn-show {
    width: 100%;
    height: 100%;
    padding: 5px;
}
</style>
