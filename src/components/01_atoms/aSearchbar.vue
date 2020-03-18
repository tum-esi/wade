<template>
    <div class="searchbar-container">
        <input 
            class="searchbar-input" 
            placeholder="Filter"
            v-model="searchInput"
        />
        <img
            class="searchbar-icon" 
            :src="iconSrc" 
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aSearchbar',
    data() {
        return {
            searchInput: ''
        };
    },
    computed: {
        iconSrc(): any {
            return require(`@/assets/search.png`);
        }
    }
});

</script>

<style scoped>
.searchbar-container {
    display: flex;
    border: 1px solid #393B3A;
    border-radius: 3px;
}

.searchbar-input {
    border: none;
    background: none;
    width: 80%;
    padding: 5px;
}

.searchbar-input:focus .searchbar-input:active {
    box-shadow: none;
    outline: none;
}

.searchbar-icon {
    width: 20%;
    padding: 5px;
    object-fit: contain;
}

.searchbar-icon:hover {
    cursor: text;
}
</style>
