import { ElementTypeEnum, VtStatus } from '@/util/enums';

abstract class BasicElement implements WADE.NewStoreElementInterface {
    public title: string
    public id: string
    public type: ElementTypeEnum
    public parentId: string
    constructor(param: WADE.NewStoreElementInterface) {
        this.title = param.title;
        this.id = param.id;
        this.type = param.type;
        this.parentId = "parent";
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
    public description: string
    public children: (WADE.ChildlessElementInterface | WADE.ParentElementInterface)[]
    constructor(param: WADE.ParentElementInterface) {
        super(param);
        this.description = param.description;
        this.children = param.children;
        this.hasChildren = true
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
    }
    constructor(param: WADE.TDElementInterface){
        super(param);
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
    public children: (Mashup | TD)[] ;
    public systemDescription: string | undefined;

    constructor(param: WADE.MashupElementInterface) {
        super(param)
        this.type = ElementTypeEnum.MASHUP;
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
            this.children.push(child)
        }
    }
}
export class Folder extends ParentElement implements WADE.FolderElementInterface {
    public type: ElementTypeEnum.FOLDER;
    public tds: TD[] ;
    public mashups: Mashup[] ;
    public folders: Folder[];
    public children: (Mashup | TD)[] ;
    public systemDescription: string | undefined;

    constructor(param: WADE.FolderElementInterface) {
        super(param)
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
            this.children.push(child)
        }
    }
}
