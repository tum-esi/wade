<template>
    <div class="mashup-container">
        Mashups.
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'tMashup',
    created() {
        this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
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
.mashup-container {
    padding: 7px;
}
</style>
