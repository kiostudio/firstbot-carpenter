/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const firstbotStreamioAction = /* GraphQL */ `
  query FirstbotStreamioAction($params: String) {
    firstbotStreamioAction(params: $params)
  }
`;
export const firstbotAnthropicRuntime = /* GraphQL */ `
  query FirstbotAnthropicRuntime($params: String) {
    firstbotAnthropicRuntime(params: $params)
  }
`;
export const getProfile = /* GraphQL */ `
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const listProfiles = /* GraphQL */ `
  query ListProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        createdAt
        updatedAt
        data
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLogging = /* GraphQL */ `
  query GetLogging($id: ID!) {
    getLogging(id: $id) {
      id
      createdAt
      updatedAt
      profileId
      type
      data
      __typename
    }
  }
`;
export const listLoggings = /* GraphQL */ `
  query ListLoggings(
    $filter: ModelLoggingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLoggings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        createdAt
        updatedAt
        profileId
        type
        data
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLoggingByProfileId = /* GraphQL */ `
  query GetLoggingByProfileId(
    $profileId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLoggingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    getLoggingByProfileId(
      profileId: $profileId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        createdAt
        updatedAt
        profileId
        type
        data
        __typename
      }
      nextToken
      __typename
    }
  }
`;
