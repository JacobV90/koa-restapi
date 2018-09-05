import * as fs from 'fs';
import * as ts from 'typescript';
import {resolve} from "path";
import * as TJS from "typescript-json-schema";
import {ApiEndpointDetails, SchemaDoc} from './types';
let glob = require('glob-fs')({ gitignore: true });

const settings: TJS.PartialArgs = {
  required: true,
  ref: true,
  topRef: true
};
const program = TJS.getProgramFromFiles([resolve("./test/basic-crud/users/model/models.ts")]);
const generator = TJS.buildGenerator(program, settings);
const files = glob.readdirSync('./test/basic-crud/users/api/*.ts');

let file: string;
let apis: ApiEndpointDetails[] = [];
let schemaDoc: SchemaDoc = {};

function visit(node: ts.Node) {
  if (ts.isClassDeclaration(node)) {
    if(node.heritageClauses) {
      node.heritageClauses.forEach((heritageClause: ts.HeritageClause) => {
        if (heritageClause.token === 85 && heritageClause.getText().includes('RestApiEndpoint')) {
          let api: any = {
            name: node.name.escapedText
          };
          heritageClause.types.forEach((params: ts.ExpressionWithTypeArguments) => {
            let i = 0;
            params.typeArguments.forEach((type: ts.Node) => {
              i == 0 ?
                api.requestObjType = type.getText() :
                api.responseObjType = type.getText();
              i++;
            })
          });
          apis.push(api);
        }
      });
    }
  }
  node.forEachChild(visit);
}

function instrument(fileName: string, sourceCode: string) {
  const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
  visit(sourceFile);
  file = fileName;
}

files.forEach((filePath: string) => {
  instrument(filePath, fs.readFileSync(filePath, 'utf-8'));
});

apis.forEach((api:any) => {
  // We can either get the schema for one file and one type...
  const req_schema = generator.getSchemaForSymbol(api.requestObjType);
  const res_schema = generator.getSchemaForSymbol(api.responseObjType);

  schemaDoc[api.name] = {
    request: req_schema,
    response: res_schema
  };
});

fs.writeFileSync('./.api.schemas.json', JSON.stringify(schemaDoc), 'utf-8');
