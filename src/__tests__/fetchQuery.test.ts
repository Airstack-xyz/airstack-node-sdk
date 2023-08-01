
import { init } from "../init";
import { fetchQuery } from '../apis/fetchQuery';

const demoAPIKey = "ef3d1cdeafb642d3a8d6a44664ce566c";
const demoQuery = `query tokens($address: Identity!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: 1, blockchain: ethereum}
  ) {
    data:TokenBalance {
      amount
      formattedAmount
      chainId
      id
      tokenAddress
      tokenId
      tokenType
      token {
        name
        symbol
      }
    }
  }
}`

describe('fetchQuery', () => {
  it('should fail if no api key is porivded', async () => {

    const variables = {
      "address": "vitalik.eth"
    };

    const { data, error } = await fetchQuery(demoQuery, variables);
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  it('should return a promise with the data and error properties', async () => {
    const variables = {
      "address": "vitalik.eth"
    };

    init(demoAPIKey);

    const { data, error } = await fetchQuery(demoQuery, variables);
    expect(error).toBeNull();
    expect(data.erc20.data).toHaveLength(1);
  });

  it('should return an error if the query fails', async () => {
    const query = 'query { unknownField }';
    const variables = {};
    init(demoAPIKey)

    const { error, data } = await fetchQuery(query, variables);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});
