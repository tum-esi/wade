<template>
    <div class="filters-container">
        <div class="header">
            <label>Filters and Constraints</label>
        </div>
        <div class="body">
            <div>
                <h4>Allowed Types:</h4>
                <div>
                    <input type="checkbox"> <label>String</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Integer</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Number</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Boolean</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Array</label>
                </div>
                <div>
                    <input type="checkbox"> <label>Object</label>
                </div>
            </div>
            <div>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'mFilterConstraintsAreaMaGe',
    props: {
        constraintsForm: {
            type: Object,
            required: false
        }
    }
});
</script>

<style lang="less" scoped>
.filters-container {
    border: 0.5pt solid #393B3A;
    border-radius: 3pt;
}

.header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-bottom: 0.5pt solid #393B3A;
    padding: 5pt;
}

.body {
    display: flex;
    flex-flow: row nowrap;
    background-color: #939C9E;
    padding: 5pt;
}


</style>