import { IntrospectionSchema, IntrospectionType } from 'graphql';
import { config } from '../../config';
import { AIRSTACK_ENDPOINT } from '../../constants';
import { introspectionQuery } from '../../constants/introspectionQuery';
import fetch from '../fetch';

export type SchemaMap = Record<string, IntrospectionType>;
const cache: {
  schema: SchemaMap | null;
} = {
  schema: null,
};

let inProgressRequest: Promise<SchemaMap> | null = null;

export async function getIntrospectionQueryMap(): Promise<SchemaMap> {
  if (cache.schema) {
    return cache.schema;
  }

  if (inProgressRequest) {
    return inProgressRequest;
  }

  inProgressRequest = fetch(AIRSTACK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': config.authKey
    },
    body: JSON.stringify({
      query: introspectionQuery,
      operationName: 'IntrospectionQuery',
    }),
  })
    .then((res: any) => res.json())
    .then((res: any) => {
      inProgressRequest = null;
      const schemaMap: Record<string, IntrospectionType> = {};
      (res.data.__schema as IntrospectionSchema).types.forEach((type) => {
        schemaMap[type.name.toLowerCase()] = type;
      });

      cache.schema = schemaMap;
      return schemaMap;
    });

  return inProgressRequest!;
}
