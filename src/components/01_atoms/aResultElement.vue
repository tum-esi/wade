<template>
    <div class="result-container">
        <div class="result-outcome" :class="{ 'is-subscription' : isSubscription }">
            <div class="result-title"><label>{{ resultTitle }}</label></div>
            <div class="result-values" :class="{ 'error' : resultError }">
                <label> 
                    {{ isSubscription ? resultValText : resultValue }}
                </label>
            </div>
        </div>
        <div v-if="isSubscription" class="result-unsubscribe">
            <aButtonBasic
                v-on:unsubscribe="unsubscribe()"
                :btnClass="'unsubscribe-btn'"
                :btnLabel="'Unsubscribe'"
                :btnOnClick="'unsubscribe'"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PossibleInteractionTypesEnum } from '@/util/enums';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';

export default Vue.extend({
    name: 'aResultElement',
    components: {
        aButtonBasic
    },
    props: {
        resultType: {
            type: String,
            required: true,
        },
        resultTitle: {
            type: String,
            required: true
        },
        resultValue: {
            required: false
        },
        resultError: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    created() {
        // this.$eventHub.$on('unsubscribe', this.unsubscribe());
        if (this.isSubscription) this.getResultValue();
    },
    beforeDestroy() {
        // this.$eventHub.$off('unsubscribe');
        },
    data() {
        return {
            isSubscription: this.resultType === PossibleInteractionTypesEnum.EVENT_SUB,
            resultValText: 'Waiting...',
            subscription: null as any
        };
    },
    methods: {
        getResultValue() {
            try {
                if (this.subscription) this.subscription.unsubscribe();
                this.subscription = (this as any).resultValue.subscribe(
                    res => this.resultValText = res,
                    error => this.resultValText = error,
                    () => this.resultValText = 'Completed'
                );
            } catch (error) {
                return `Error: ${error}`;
            }
        },
        unsubscribe() {
            if (!this.subscription) return;
            try {
                this.subscription.unsubscribe();
            } catch (error) {
                // Show error here
            }
        }
    }
});
</script>

<style scoped>
.result-container {
    display: flex;
    width: 100%;
}

.result-outcome {
    display: flex;
    height: 35px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    margin: 5px 0 0 0;
    background: #939C9E;
    width: 100%;
}

.result-unsubscribe {
    width: 30%;
    height: 35px;
    margin: 5px 0 0 5px;
}

.is-subscription {
    width: 70%;
}

.result-title {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 7px;
}

.result-values {
    width: 50%;
    display: flex;
    align-items: center;
    border-left: 1px solid #393B3A;
    padding-left: 7px;
    overflow: auto;
}

.result-values label {
    overflow: auto;
    max-height: 100%;
}
</style>
