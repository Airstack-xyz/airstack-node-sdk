import { fetchGql } from '../utils/fetcher';
import { FetchQuery, ResponseType, Variables } from '../types';
import { stringifyObjectValues } from '../utils/stringifyObjectValues';

export async function fetchQuery(
  query: string,
  variables?: Variables
): Promise<Pick<FetchQuery, 'data' | 'error'>> {
  const _variables: Variables = stringifyObjectValues(variables || {});

  let data: null | ResponseType = null;
  let error = null;

  const [response, _error] = await fetchGql<any>(query, _variables);
  data = response;
  error = _error;

  return {
    data,
    error,
  };
}
