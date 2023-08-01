import { addPaginationToQuery } from '../utils/addPaginationToQuery';
import { fetchGql } from '../utils/fetcher';
import { FetchQuery, ResponseType, Variables } from '../types';

import { getPaginationData } from '../utils/getPaginationData';
import { stringifyObjectValues } from '../utils/stringifyObjectValues';
import { removeQueriesIfNoNextPage } from '../utils/removeQueriesIfNoNextPage';

async function fetchPaginatedQuery(
  originalQuery: string,
  variables?: Variables,
): Promise<FetchQuery> {
  let query = originalQuery;
  const nextCursorsCache: Record<string, string>[] = [];
  const deletedQueryCache: (null | {
    query: string;
    cursors: Record<string, string>;
  })[] = [];

  let paginationData: ReturnType<typeof getPaginationData> = {
    hasNextPage: false,
    hasPrevPage: false,
    nextCursors: {},
    prevCursors: {},
  };
  let lastResponse: ResponseType | null = null;
  let inProgressRequest: Promise<FetchQuery> | null = null;

  async function fetch(
    _query: string,
    _variables?: Variables,
  ): Promise<FetchQuery> {
    const variables: Variables = stringifyObjectValues(_variables || {});

    let data: null | ResponseType = null;
    let error = null;

    const [response, _error] = await fetchGql<any>(_query, variables);
    data = response;
    error = _error;

    paginationData = getPaginationData(data);
    lastResponse = data;

    return {
      data,
      error,
      hasNextPage: paginationData.hasNextPage,
      hasPrevPage: paginationData.hasPrevPage,
      getNextPage: handleNext,
      getPrevPage: handlePrev,
    };
  }

  const handleNext = async () => {
    if (inProgressRequest) {
      return inProgressRequest;
    }

    if (paginationData.hasNextPage) {
      nextCursorsCache.push(paginationData.nextCursors);
      const upatedQuery = await removeQueriesIfNoNextPage(
        query,
        lastResponse as ResponseType
      );
      deletedQueryCache.push(
        upatedQuery
          ? {
            query,
            cursors: paginationData.nextCursors,
          }
          : null
      );
      if (upatedQuery) {
        query = upatedQuery;
      }

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          ...paginationData.nextCursors,
        }
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  const handlePrev = async () => {
    if (inProgressRequest) {
      return inProgressRequest;
    }

    if (paginationData.hasPrevPage) {
      nextCursorsCache.pop();

      const { query: deletedQuery } = deletedQueryCache.pop() || {};

      let cachedCursors: Record<string, string> = {};
      let cursors = {};

      if (deletedQuery) {
        // If the previous page query was deleted, we can't use cursors returned by that query to retrieve the previous page.
        // The cursors used in the deleted query brought us to the current page where the query was removed.
        // Therefore, we need to use the next cursors from the query preceding the deleted query to navigate to the previous page.
        cachedCursors = nextCursorsCache.pop() || {};
        deletedQueryCache.pop();
        query = deletedQuery;
        cursors = { ...cachedCursors };
      } else {
        cursors = { ...cachedCursors, ...paginationData.prevCursors };
      }

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          ...cursors,
        }
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  return fetch(query, variables);
}

export async function fetchQueryWithPagination(
  query: string,
  variables?: Variables,
): Promise<FetchQuery> {
  const queryWithPagination = await addPaginationToQuery(query);

  return fetchPaginatedQuery(
    queryWithPagination,
    variables || {},
  );
}
