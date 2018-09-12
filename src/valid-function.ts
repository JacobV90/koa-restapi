import { config } from './config';
import * as Ajv from 'ajv';
import { resolve } from 'path';
import { SchemaDoc } from './types';

export abstract class ValidIO<In, Out> {

    private _schemaDoc: SchemaDoc;
    public validateParameters: Ajv.ValidateFunction;
    public validateResponse: Ajv.ValidateFunction;

    constructor(fileName: string, ioName: string, options: object){
        const validator = new Ajv(options);
        this._schemaDoc = this.shema(fileName);
        this.validateParameters = validator.compile(this._schemaDoc[ioName].request);
        this.validateResponse = validator.compile(this._schemaDoc[ioName].response);
    }

    private shema(fileName: string): SchemaDoc {
        return require(resolve(config.outDir, './' + fileName));
    }
}