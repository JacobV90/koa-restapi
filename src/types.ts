export type ApiEndpointDetails = {
  name: string;
  requestObjType: string;
  responseOjbType: string;
}

export type Schema = {
  request: string;
  response: string;
}

export type SchemaDoc = {
  [apiName: string]: Schema
}
