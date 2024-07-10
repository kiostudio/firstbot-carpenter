/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onCreateProfile(filter: $filter) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onUpdateProfile(filter: $filter) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile($filter: ModelSubscriptionProfileFilterInput) {
    onDeleteProfile(filter: $filter) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const onCreateLogging = /* GraphQL */ `
  subscription OnCreateLogging($filter: ModelSubscriptionLoggingFilterInput) {
    onCreateLogging(filter: $filter) {
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
export const onUpdateLogging = /* GraphQL */ `
  subscription OnUpdateLogging($filter: ModelSubscriptionLoggingFilterInput) {
    onUpdateLogging(filter: $filter) {
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
export const onDeleteLogging = /* GraphQL */ `
  subscription OnDeleteLogging($filter: ModelSubscriptionLoggingFilterInput) {
    onDeleteLogging(filter: $filter) {
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
