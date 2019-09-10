<template>
    <div class="config-container">
        <!-- <label>Default Configuration</label> -->
        <div class="default-config-container">
            <label>Configuration</label>
            <!-- <div class="config-view-options">
                <div>
                    <input
                    type="radio"
                    class="config-checkbox"
                    v-model="currentValue"
                    :id="configDisplayOptions.beauty"
                    >
                    <label class="config-checkbox-label" :for="configDisplayOptions.beauty">{{ configDisplayOptions.beauty }}</label>
                </div>
            </div> -->
            <textarea class="config-textarea" spellcheck="false" wrap="off" v-model="getCurrentConfig"></textarea>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
export default Vue.extend({
    name: 'oConfig',

    data() {
        return {
            id: '',
            currentConfig: '',
            configDisplayOptions: {
                raw: 'raw',
                beauty: 'form-data'
            },
            currentValue: undefined
        };
    },
    computed: {
        // What do I need ?
        // #1 
        ...mapGetters('TdStore', ['getConfig']),
        getCurrentConfig(): any {
            let config = (this as any).getConfig;
            try {
                config = JSON.stringify(JSON.parse(config), null, 2);
            } catch {
                // TODO:
            }
            return config;
            // return (this as any).getConfig(this.id ? this.id : this.$route.params.id);
        }
    },
    watch: {
        // Check if router id changed and change active sidebar element
        '$route.params.id'(id) {
            this.$store.commit('SidebarStore/setActiveElement', id);
        }
    }
});
</script>


<style scoped>
.config-container {
    padding: 7px;
    display: flex;
}

.default-config-container .mqtt-config-container {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
}

textarea {
    resize: false;
    height: 100%;
}

.config-textarea {
    resize: none;
    width: 500px;
    height: 500px;
}

</style>
