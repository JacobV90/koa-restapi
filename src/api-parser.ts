import * as fs from 'fs';
import * as ts from 'typescript';
import {resolve} from "path";
import * as TJS from "typescript-json-schema";
import chalk from 'chalk';
import { ApiEndpointDetails, SchemaDoc} from './types';
import { config } from './config';

let glob = require('glob-fs')({ gitignore: true });
const apiFiles = glob.readdirSync(config.include);
const errors: string[] = [];
const settings: TJS.PartialArgs = {
  required: true,
  ref: true,
  topRef: true
};

let apis: ApiEndpointDetails[] = [];
let schemaDoc: SchemaDoc = {};
  
export class ApiParser {

  public static parse() {
    console.log(chalk.cyan('Parsing Files...'));
    console.log('\r');

    const program = TJS.getProgramFromFiles([resolve(config.models)]);
    const generator = TJS.buildGenerator(program, settings);

    let counter = 0;
    apiFiles.forEach((filePath: string) => {
      console.log(chalk.whiteBright(filePath))
      let file = fs.readFileSync(filePath, 'utf-8');
      ApiParser.instrument(filePath, file);
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
  
    fs.writeFileSync(config.outDir + 'api.schemas.json', JSON.stringify(schemaDoc), 'utf-8');
    errors.forEach((error: string) => {
      console.log(chalk.redBright(error));
    })
    console.log('\r');
    console.log(chalk.bold.greenBright('Finished generating API json schemas'));
    console.log('\r');

  }
  private static visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      if(node.heritageClauses) {
        node.heritageClauses.forEach((heritageClause: ts.HeritageClause) => {
          if (heritageClause.token === 85 && heritageClause.getText().includes('RestApiEndpoint')) {
            let api: any = {
              name: node.name.escapedText
            };
            heritageClause.types.forEach((params: ts.ExpressionWithTypeArguments) => {
              let i = 0;
              if (params.typeArguments) {
                params.typeArguments.forEach((type: ts.Node) => {
                  i == 0 ?
                    api.requestObjType = type.getText() :
                    api.responseObjType = type.getText();
                  i++;
                })
                apis.push(api);
              } else {
                errors.push('RestApiEndpoint has no types for sub class: ' + api.name);
              }
            });
          }
        });
      }
    }
    node.forEachChild(ApiParser.visit);
  }
  
  private static instrument(fileName: string, sourceCode: string) {
    const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
    ApiParser.visit(sourceFile);
  }
}
