export type PageInfo = {
  prevCursor: string;
  nextCursor: string;
};

export type ResponseType = {
  [key: string]: {
    pageInfo: PageInfo;
  };
};

export type QueryContext = { variableNamesMap: Record<string, number> };

export type FetchQuery = {
  data: any;
  error: any;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getNextPage: () => Promise<FetchQuery | null>;
  getPrevPage: () => Promise<FetchQuery | null>;
};

export type Variables = Record<string, any>;
