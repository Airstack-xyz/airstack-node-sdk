# Airstack Node SDK

The Airstack Node SDK provides a convenient way for web developers to integrate Airstack's blockchain functionalities into their Node.js applications.

With the provided methods, you can use to easily query and fetch data from smart contracts.

## Installation

#### With NPM

```sh
npm install @airstack/node
```

#### With yarn

```sh
yarn add @airstack/node
```

#### With pnpm

```sh
pnpm install @airstack/node
```

## Getting started

To use the SDK you will need airstack api-key, which you can find in your profile setting section in [airstack web](https://app.airstack.xyz), once you have it you can call the `init` function with the api-key.

**`init` must be called before calling fetchQuery or  fetchQueryWithPagination**.

```typescript
import { init } from "@airstack/node";

init("api-key");
```

## fetchQuery

##### Parameters
`fetchQuery` accepts 2 parameters:
- `query` (required): A string that represents the Airstack GraphQL query to be executed.
- `variables`: An object that contains variables used in the query.

`fetchQuery` returns a promise with an object, which contains the following properties:

- `data`: The response data returned by the server.
- `error`: An error object, if an error occurred during the network request.

##### Example

```typescript
import { fetchQuery } from "@airstack/node";

const { data, error } = await fetchQuery(query, variables);
```

## fetchQueryWithPagination

##### Parameters
`fetchQueryWithPagination` take same parameters as `fetchQuery`.

It returns a promise with an object, which contains the following properties:

- `data`: The response data returned by the server.
- `error`: An error object, if an error occurred during the network request.
- `hasNextPage`: A boolean that indicates whether there is a next page of data available.
- `hasPrevPage`: A boolean that indicates whether there is a previous page of data available.
- `getNextPage()`: A function that returns a next page `data`, `error`, `hasNextPage`, `hasPrevPage`, `getNextPage` and `getPrevPage`. It returns `null` if there is no next page.
- `getPrevPage()`: A function that returns previous page `data`, `error`, `hasNextPage`, `hasPrevPage`, `getNextPage` and `getPrevPage`. It returns `null` if there is no previous page.
  
**Note:** fetchQueryWithPagination only works with queries that has support for pagination.

##### Example

```typescript
import { fetchQueryWithPagination } from "@airstack/node";

const { data, error, hasNextPage, hasPrevPage, getNextPage, getPrevPage } =
  await fetchQueryWithPagination(query, variables);
```
