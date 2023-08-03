import { config } from '../config';
import { AIRSTACK_ENDPOINT } from '../constants';
import { Variables } from '../types';
import fetch from './fetch';

export async function _fetch<ResponseType = any>(
  query: string,
  variables: Variables
): Promise<[ResponseType | null, any]> {
  if (!config.authKey) {
    return [null, Error('No API key provided')];
  }
  try {
    const res = await fetch(AIRSTACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.authKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = (await res.json()) as any;
    const data = json?.data;
    let error = null;
    if (json.errors) {
      error = json.errors;
    }
    return [data, error];
  } catch (error) {
    return [
      null,
      (error as { message: string })?.message || 'Unable to fetch data',
    ];
  }
}

export async function fetchGql<ResponseType = any>(
  query: string,
  variables: Variables
): Promise<[ResponseType | null, any]> {
  return _fetch<ResponseType>(query, variables);
}
