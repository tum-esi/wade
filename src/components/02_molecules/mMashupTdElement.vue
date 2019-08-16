<template>
    <div
        class="mashup-td-element-container"
        :class="{ 'isActiveTd': isActiveTd }"
        @click.prevent="showCurrentTd = !showCurrentTd"
    >
        <label class="mashup-td-label">{{ this.td.id }}</label>
        <img
            class="mashup-td-show-interactions-icon"
            @mouseover="interactionsHover = true"
            @mouseleave="interactionsHover = false"
            :src="showCurrentTd ? interactionsHover ? srcPathDropdownWhite : srcPathDropdown : interactionsHover ? srcPathDropdownClosedWhite : srcPathDropdownClosed"
            @click.stop="showCurrentTd = !showCurrentTd"
        />
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';

export default Vue.extend({
  name: 'mMashupTdElement',
  props: {
    td: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
        interactionsHover: false,
        showCurrentTd: false,
        srcPathDropdown: require('@/assets/arrow_down.png'),
        srcPathDropdownClosed: require('@/assets/arrow_right.png'),
        srcPathDropdownWhite: require('@/assets/arrow_down_white.png'),
        srcPathDropdownClosedWhite: require('@/assets/arrow_right_white.png'),
    };
  },
  computed: {
    isActiveTd(): boolean {
      // TODO: check if This Td is active clicked td
      return true;
    }
  },
  methods: {}
});
</script>

<style scoped>
.mashup-td-element-container {
    height: 50px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    background: #939c9e;
    border-top: 1px solid #393B3A;
}

.mashup-td-element-container:hover {
    background: #1234;
}

.mashup-td-label {
  width: 65%;
  overflow: hidden;
}

.mashup-td-show-interactions-icon {
    padding: 10px;
    height: 40px;
    width: 40px;
}
</style>
