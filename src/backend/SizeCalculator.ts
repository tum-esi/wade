/**
 * Resource: https://stackoverflow.com/questions/23318037/size-of-json-object-in-kbs-mbs
 */
export default class SizeCalculator {

    public getSize(el: any) {
        return this.memorySizeOf(el);
    }

    private memorySizeOf(object: any): string {
        let bytes = 0;

        function sizeOf(obj: any): number {
            if (obj !== null && obj !== undefined) {
                switch (typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    const objClass = Object.prototype.toString.call(obj).slice(8, -1);
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (const key in obj) {
                            if (!obj.hasOwnProperty(key)) continue;
                            sizeOf(obj[key]);
                        }
                    } else bytes += obj.toString().length * 2;
                    break;
                }
            }
            return bytes;
        }

        function formatByteSize(byt: number): string {
            if (byt < 1024) return byt + ' bytes';
            else if (byt < 1048576) return(byt / 1024).toFixed(3) + ' KiB';
            else if (byt < 1073741824) return(byt / 1048576).toFixed(3) + ' MiB';
            else return(byt / 1073741824).toFixed(3) + ' GiB';
        }

        return formatByteSize(sizeOf(object));
    }
}
