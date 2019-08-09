import Vue, { VNode } from 'vue';


declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  namespace WADE {
    // TODO: get alll available input types
    enum AvailablePropertyDataTypesEnum {
      STRING = 'string',
      NUMBER = 'number',
      BOOLEAN = 'boolean'
    }

    enum ElementTypeEnum {
      FOLDER = 'folder',
      TD = 'td',
      MASHUP = 'mashup'
    }

    interface ModalAddElementInterface {
      type: string;
      src: string;
      title: string;
      forms: ModalAddElementFormItem[];
    }

    interface ModalAddElementFormItem {
      key: string;
      title: string;
      placeholder: string;
      value: string;
      required: boolean;
    }
    /**
     * The outcome fields of a basic formfield
     */
    interface BasicFormFieldOutputInterface {
      // Key which indicates the meaning of formfield
      key: string;
      // The value of the user's input
      input: string;
      // Is true when the input is empty or violates the rules of the formfield which has the type BasicFormField
      hasError: boolean;
      hasDuplicateError: boolean;
    }
    interface BasicFormFieldInterface {
      key: string;
      title: string;
      placeholder: string;
      value: string;
      isRequired: boolean;
      mustBeUnique?: boolean;
      rules?: {
        minChars: number,
        maxChars: number,
        exludedChars?: string[],
        errorMessage?: string,
        errorMessageDuplicate?: string
      };
    }

    interface AIconButtonInterface {
      // Path of icon source to be displayed
      iconBtnSrcPath: string;
      // Defines button action
      iconBtnOnClick: string;
      // Optional label below icon
      iconBtnLabel?: string;
      // Show button only when hovered
      iconBtnShowOnlyOnHover?: boolean;
    }

    interface ADropdowButtonInterface {
      // Optional label of the button to be displayed
      btnLabel?: string;
      // The key should explain the main purpose of the button.
      // Use kebap-case. E.g. "property-invoke" or "td-upload"
      btnKey: string;
      // Source path for the button's icon.
      btnSrc?: string;
      // A list of all options for the dropdown.
      btnDropdownOptions: DropdownOptionInterface[];
    }

    interface DropdownOptionInterface {
      title: string;
      key: string;
      // Image path for icon
      icon?: string;
      style?: string;
      selectable?: boolean;
      editable?: boolean;
      type?: AvailablePropertyDataTypesEnum;
      inputValue?: undefined | null | string | number; // TODO: get alll available input
    }

    interface SidebarElement {
      // Title to be shown in the sidebar
      title: string;
      // Id to identify the associated data
      id: string;
      // Type of the element
      type: ElementTypeEnum;
      // Icon path
      iconSrcPath: string | any;
      // Has this element any children
      hasChildren?: boolean;
      // Array of Elements. A TD can't have any children.
      children?: SidebarElement[];
      // Has this Element a Timing performance
      hasTimingPerformance?: boolean;
      // If element is td
      td?: object;
      // If element is folder
      folder?: object;
      // If element is mashup
      mashup?: object;
      // Optional string for element style
      styleCss?: string;
    }

    interface TabbarElementInterface {
      // To reference tab when clicked.
      tabId: string;
      // Label for tab.
      tabTitle?: string;
      // When tab needs special styling.
      tabStyle?: string;
      // When tab should display a icon button.
      tabIconButton?: AIconButtonInterface;
      // When tab should display a icon button.
      tabDropdownButton?: ADropdowButtonInterface;
      // When button should be left or right.
      tabButtonStyle?: string;
      // If tab is router link.
      tabLink?: string;
      // If tab is active / should have indication to be active.
      tabIsActive?: boolean;
    }
  }
}
