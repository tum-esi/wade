<template>
    <div class="folder-container">
        Folders.
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'tFolder',
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
.folder-container {
    padding: 7px;
}
</style>
