<template>
    <div class="protocol-selection-container">
        <div class="protocol-title">
            <label>Select Protocol</label>
        </div>
        <div class="protocol-area">
            <p></p>
            <div v-for="(element,index) in allProtocols">
            <input 
                type="radio"
                name="protocol"
                :value="element"
                :id="element"
                :disabled="getProtocols($route.params.id).indexOf(element) === -1"
                v-model="selectedProtocol"
            >
            <label :for="element">{{ element }}</label>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
    name: 'oProtocolSelection',
    data() {
        return {
            numOfSelectableProtocols: 0,
            allProtocols: ['http', 'https', 'coap', 'coaps', 'mqtt'],
            texts: [
                'Only one protocol is available in your TD. You cannot choose your protocol.',
                'Select your preffered protocol type.'
            ],
            // selectedProtocol: (this as any ).getProtocols(this.$route.params.id)[0] || '',
            selectedProtocol: 'http',
            availableProtocols: ['http'],
            random: false
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getProtocols'])
    }

            // TODO:
            // Here it needs to be checked wether there is only one protocol to choose from
            // -> then it can't be deselected
            // If there's more than chosse the preferred one (for all)
            // If you want to select specific protocols per interaction do this in the editor tab
});
</script>


<style scoped>
.protocol-selection-container {
    width: 100%;
    height: 100%;
    padding: 0px 12px 10px 12px;
}

.protocol-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}
</style>
