<template>
  <div class="modal-container">
    <div class="add-el-container">
      <aHeaderElement
        :title="modalElement.title"
        :type="modalElement.type"
        v-on:cancel-btn-clicked="cancel"
      />
      <div class="middle-container">
        <aFormfield
          class="middle-container-el"
          v-for="element in modalElement.forms"
          :key="element.key"
          :form="element"
          ref="formElement"
        />
      </div>
      <aFooterElement v-bind:buttons="footerButtons"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aHeaderElement from '@/components/01_atoms/aHeaderElement.vue';
import aFormfield from '@/components/01_atoms/aFormfield.vue';
import aFooterElement from '@/components/01_atoms/aFooterElement.vue';

export default Vue.extend({
    name: 'oModal',
    components: {
      aHeaderElement,
      aFormfield,
      aFooterElement
    },
    props: {
      modalElement: {
        type: Object as () => WADE.ModalAddElementInterface,
        required: true
      }
    },
    data() {
      return {
        src: require('@/assets/mashup.png'),
        hasError: false,
        newElement: {
          type: '',
          data: [{}]
        },
        defaultSrc: '',
        footerButtons: [
          {
            btnClass: 'btn-grey',
            btnLabel: 'Cancel',
            btnOnClick: 'cancel-btn-clicked'
          },
          {
            btnClass: 'btn-pos',
            btnLabel: 'Create',
            btnOnClick: 'create-btn-clicked'
          }
        ]
      };
    },
    created() {
      this.$eventHub.$on('create-btn-clicked', this.create);
      this.$eventHub.$on('cancel-btn-clicked', this.cancel);
    },
    beforeDestroy() {
      this.$eventHub.$off('create-btn-clicked');
      this.$eventHub.$off('cancel-btn-clicked');
    },
    methods: {
      cancel() {
        this.$emit('cancel');
        // Delete input from form elements
        (this as any).$refs.formElement.forEach((element: any) => {
          element.input = '';
        });
      },
      create() {
        // Reset values for newElement
        let hasError = false;
        this.newElement.type = this.modalElement.type;
        this.newElement.data = [];

        // Check if formfields are correct
        this.$eventHub.$emit('check-has-error');
        const formElements: WADE.BasicFormFieldOutputInterface[] | any = this.$refs
          .formElement;
        formElements.forEach((element: WADE.BasicFormFieldOutputInterface) => {
          if (element.hasError) {
            // Cancel if one of the formFields has an error
            hasError = true;
          } else if (element.hasDuplicateError) {
            hasError = true;
          } else if (element.input) {
            console.log('element obj:', element);
            // Push form data to newElement and delete form input
            const newDataElement = {
              key: element.key,
              value: element.input
            };
            this.newElement.data.push(newDataElement);
            element.input = '';
          }
        });
        // Create a new element
        if (!hasError) {
          this.$emit('create-element', this.newElement);
        }
      }
    }
});
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.add-el-container {
  border: 1px solid #b4bab9;
  border-radius: 3px;
  display: inline-block;
  width: 80%;
  background: #fff;

  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.middle-container {
  height: 250px;
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #b4bab9;
  display: flex;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
}

.middle-container-el {
  padding-bottom: 10px;
  width: 100%;
}
</style>

