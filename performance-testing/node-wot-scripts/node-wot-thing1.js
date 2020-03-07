let writeString = "success";
let writeBoolean = true;
let writeInteger = 0;

WoT.produce({
    title: "virtual-test-thing-1",
    description: "node-wot servient for virtual test #1",
    "@context": ["https://www.w3.org/2019/wot/td/v1", {"iot": "http://example.org/iot"}],
    properties: {
        readString: {
            type: "string", 
            readOnly: true
        },
        readBoolean: {
            type: "boolean",
            readOnly: true
        },
        readInteger: {
            type: "integer", 
            readOnly: true
        },
        writeString: {
            type: "string", 
            writeOnly: true
        },
        writeBoolean: {
            type: "boolean",
            writeOnly: true
        },
        writeInteger: {
            type: "integer",
            writeOnly: true
        }
    }
})
.then((thing) => {
    console.info(`Produced ${thing.title}.`);

    thing.setPropertyWriteHandler(
        "writeString",
        (value) => {
            return new Promise((resolve, reject) => {
                writeString = value;
                resolve(value)
            })
        }
    );

    thing.setPropertyWriteHandler(
        "writeBoolean",
        (value) => {
            return new Promise((resolve, reject) => {
                writeBoolean = value;
                resolve(value)
            })
        }
    );

    thing.setPropertyWriteHandler(
        "writeInteger",
        (value) => {
            return new Promise((resolve, reject) => {
                writeInteger = value;
                resolve(value)
            })
        }
    );

    thing.setPropertyReadHandler(
        "readString",
        () => {
            return new Promise((resolve, reject) => {
                resolve(writeString);
            })
        }
    );

    thing.setPropertyReadHandler(
        "readBoolean",
        () => {
            return new Promise((resolve, reject) => {
                resolve(writeBoolean);
            })
        }
    );

    thing.setPropertyReadHandler(
        "readInteger",
        () => {
            return new Promise((resolve, reject) => {
                resolve(writeInteger);
            })
        }
    );

    thing.expose()
    .then(() => {
        console.info(`${thing.title} is ready`);
    })
    .catch((err) => {
        console.info(`Could not expose ${thing.title} due to error: ${err}`);
    })
})
.catch((error) => {
    console.log(error);
});