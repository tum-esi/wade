import { ElementTypeEnum, VtStatus } from '@/util/enums';

abstract class BasicElement implements WADE.NewStoreElementInterface {
    public title: string;
    public id: string;
    public type: ElementTypeEnum;
    public parentId: string;
    constructor(param: WADE.NewStoreElementInterface) {
        this.title = param.title;
        this.id = param.id;
        this.type = param.type;
        this.parentId = 'parent';
    }
}

abstract class ChildlessElement extends BasicElement implements WADE.ChildlessElementInterface {
    public readonly hasChildren: false;
    constructor(param: WADE.ChildlessElementInterface) {
        super(param);
        this.hasChildren = false;
    }
}

abstract class ParentElement extends BasicElement implements WADE.ParentElementInterface {
    public readonly hasChildren: true;
    public description: string;
    public children: Array<WADE.ChildlessElementInterface | WADE.ParentElementInterface>;
    constructor(param: WADE.ParentElementInterface) {
        super(param);
        this.description = param.description;
        this.children = param.children;
        this.hasChildren = true;
    }
}

export class TD extends ChildlessElement implements WADE.TDElementInterface {
    public type: ElementTypeEnum.TD;
    public content: string;
    public config: {};
    public vconfig: {};
    public virtualthing: {
        status: VtStatus
        outMsg: [],
        vt: undefined // not necessary, but used to remember that property is used
    };
    constructor(param: WADE.TDElementInterface) {
        super(param);
        this.parentId = param.parentId;
        this.type = ElementTypeEnum.TD;
        this.content = param.content;
        this.config = param.config;
        this.vconfig = param.vconfig;
        this.virtualthing = param.virtualthing;
    }
}
export class Mashup extends ParentElement implements WADE.MashupElementInterface {
    public type: ElementTypeEnum.MASHUP;
    public tds: TD[] ;
    public mashups: Mashup[] ;
    public content: string;
    public children: Array<Mashup | TD> ;
    public systemDescription: string | undefined;

    constructor(param: WADE.MashupElementInterface) {
        super(param);
        this.parentId = param.parentId;
        this.type = ElementTypeEnum.MASHUP;
        this.content = "";
        this.tds = [];
        this.mashups = [];
        this.children = [];
        for (const childInterface of param.children) {
            let child;
            if (childInterface.type === WADE.ElementTypeEnum.TD) {
                child = new TD(childInterface);
                this.tds.push(child);
            }
            if (childInterface.type === WADE.ElementTypeEnum.MASHUP) {
                child = new Mashup(childInterface);
                this.mashups.push(child);
            }
            this.children.push(child);
        }
    }
}
export class Folder extends ParentElement implements WADE.FolderElementInterface {
    public type: ElementTypeEnum.FOLDER;
    public tds: TD[] ;
    public mashups: Mashup[] ;
    public folders: Folder[];
    public children: Array<Mashup | TD | Folder> ;
    public systemDescription: string | undefined;

    constructor(param: WADE.FolderElementInterface) {
        super(param);
        this.parentId = param.parentId;
        this.type = ElementTypeEnum.FOLDER;
        this.tds = [];
        this.mashups = [];
        this.folders = [];
        this.children = [];
        for (const childInterface of param.children) {
            let child;
            if (childInterface.type === WADE.ElementTypeEnum.TD) {
                child = new TD(childInterface);
                this.tds.push(child);
            }
            if (childInterface.type === WADE.ElementTypeEnum.MASHUP) {
                child = new Mashup(childInterface);
                this.mashups.push(child);
            }
            if (childInterface.type === WADE.ElementTypeEnum.FOLDER) {
                child = new Folder(childInterface);
                this.mashups.push(child);
            }
            this.children.push(child);
        }
    }
}
/**
 * Class
 */
export class GenerationForm implements MAGE.GenerationFormInterace {
    public things: {
        inputs: (WADE.TDElementInterface | WADE.MashupElementInterface)[]
        outputs: (WADE.TDElementInterface | WADE.MashupElementInterface)[]
    };
    public minInputs: number;
    public  maxInputs: number;
    public  minOutputs: number;
    public  maxOutputs: number;
    public  maxThings: number | undefined;
    public  templates: {
        "use-event-template": boolean;
        "use-action-template": boolean;
        "use-sub-template": boolean;
    };
    public filters: {
          acceptedTypes: string[],
          acceptedInputInteractionTypes: string[],
          acceptedOutputInteractionTypes: string[],
          onlySameType: boolean,
          similarityThreshold: number | null,
          semanticMatch: boolean
    };
    public generation: {
          generateCode: boolean,
          includeFunctionSkeletons: boolean
    }
    constructor() {
        this.things = {
            inputs: [],
            outputs: [],
        };
        this.minInputs = 1,
        this.maxInputs = 2,
        this.minOutputs = 1,
        this.maxOutputs = 2,
        this.maxThings = undefined,
        this.templates = {
            "use-event-template": true,
            "use-action-template": false,
            "use-sub-template": true,
        },
        this.filters = {
              acceptedTypes: ['string','integer','boolean','number'],
              acceptedInputInteractionTypes: ['property-read', 'event-subscibe', 'action-invoke'],
              acceptedOutputInteractionTypes: ['property-write', 'action-invoke'],
              onlySameType: true,
              similarityThreshold: null,
              semanticMatch: false
        },
        this.generation = {
            generateCode: false,
            includeFunctionSkeletons: false
        }
    }
}
