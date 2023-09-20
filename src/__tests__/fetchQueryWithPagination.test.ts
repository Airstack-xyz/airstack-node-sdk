import { init } from '../init';
import { fetchQueryWithPagination } from '../apis/fetchQueryWithPagination';
import { FetchQuery } from '../types';

const demoAPIKey = 'ef3d1cdeafb642d3a8d6a44664ce566c';
const demoQuery = `query tokens($address: Identity!, $limit: Int!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: $limit, blockchain: ethereum}
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
}`;

const demoVariables = {
  address: 'vitalik.eth',
  limit: 1,
};

const multiQuery = `query tokens($address: Identity!, $address2: Identity!) {
  erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC20]}}, limit: 2, blockchain: ethereum}
  ) {
    data: TokenBalance {
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
    pageInfo {
      prevCursor
      nextCursor
    }
  },
  _erc20: TokenBalances(
    input: {filter: {owner: {_in: [$address2]}, tokenType: {_in: [ERC20]}}, limit: 2, blockchain: ethereum}
  ) {
    data: TokenBalance {
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
    pageInfo {
      prevCursor
      nextCursor
    }
  }
}`;

const socialFollowersQuery = `query FollowersDetails($identity: Identity!) {
  SocialFollowers(input: {filter: {identity: {_eq: $identity}}, blockchain: ALL, limit: 2}) {
    Follower {
      id
      blockchain
      followerProfileId
      followerTokenId
      followingProfileId
      followerAddress {
        identity
        addresses
        socials {
          blockchain
          dappName
          profileName
          profileTokenId
          profileTokenAddress
        }
        primaryDomain {
          name
        }
        domains {
          dappName
          name
        }
        xmtp {
          isXMTPEnabled
        }
      }
    }
  }
}`;

describe('fetchQueryWithPagination', () => {
  it('should fail if no api key is provided', async () => {
    const { data, error } = await fetchQueryWithPagination(
      demoQuery,
      demoVariables
    );
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  it('should return a promise with the data and error properties', async () => {
    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage } =
      await fetchQueryWithPagination(demoQuery, demoVariables);
    expect(error).toBeNull();
    expect(data.erc20.data).toHaveLength(1);
    expect(hasNextPage).toBe(true);
    expect(hasPrevPage).toBe(false);
  });

  it('should fetch next page on getNextPage', async () => {
    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(demoQuery, demoVariables);
    expect(error).toBeNull();
    expect(data.erc20.data).toHaveLength(1);
    expect(hasNextPage).toBe(true);
    expect(hasPrevPage).toBe(false);
    const nextResponse = await getNextPage();
    if (nextResponse) {
      const { data: nextData, error: nextError } = nextResponse;
      expect(nextError).toBeNull();
      expect(nextData.erc20.data).toHaveLength(1);
      expect(nextData.erc20.data[0].id).not.toBe(data.erc20.data[0].id);
    }
  });

  it('should return hasNextPage as false if no next page, and getNextPage should return null', async () => {
    // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
    const variables = {
      address: 'betashop.eth',
      limit: 2,
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(demoQuery, variables);
    expect(error).toBeNull();
    expect(data.erc20.data).toHaveLength(1);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(false);
    const nextResponse = await getNextPage();
    expect(nextResponse).toBeNull();
  });

  it('should do pagination backward and forward', async () => {
    // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
    const variables = {
      address: 'betashop.eth',
      address2: 'vitalik.eth',
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(multiQuery, variables);
    // page => 0
    expect(error).toBeNull();
    expect(data.erc20.data).toHaveLength(1);
    expect(data._erc20.data).toHaveLength(2);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(true);

    let response = {
      getNextPage,
    } as FetchQuery | null;

    // page => 0 => 1 => 2 => 3
    for (let i = 0; i < 3; i++) {
      response = await response!.getNextPage();
      if (response) {
        expect(response?.data.erc20).toBeUndefined();
        expect(response?.data._erc20.data).toHaveLength(2);
      }
    }

    // page 3 => 2 => 1
    for (let i = 0; i < 2; i++) {
      response = await response!.getPrevPage();
      expect(response?.data.erc20).toBeUndefined();
      expect(response?.data._erc20.data).toHaveLength(2);
    }
    // page => 0
    response = await response!.getPrevPage();
    expect(response?.data.erc20).toBeTruthy();
  }, 15000);

  it('should do pagination backward and forward for queries with a mismatched schema', async () => {
    // this address has only 1 erc20 token, if this test fails, it means that the address has more than 1 erc20 token
    const variables = {
      identity: 'betashop.eth',
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(socialFollowersQuery, variables);
    // page => 0
    expect(error).toBeNull();
    expect(data.SocialFollowers.Follower).toHaveLength(2);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(true);

    let response = {
      getNextPage,
    } as FetchQuery | null;

    // page => 0 => 1 => 2 => 3
    for (let i = 0; i < 3; i++) {
      response = await response!.getNextPage();
      if (response) {
        expect(response?.data.SocialFollowers.Follower).toHaveLength(2);
      }
    }

    // page 3 => 2 => 1
    for (let i = 0; i < 2; i++) {
      response = await response!.getPrevPage();
      expect(response?.data.SocialFollowers.Follower).toHaveLength(2);
    }
    // page => 0
    response = await response!.getPrevPage();
    expect(response?.data.SocialFollowers.Follower).toBeTruthy();
  }, 15000);
});
