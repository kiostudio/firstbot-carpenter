/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProfile = /* GraphQL */ `
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const updateProfile = /* GraphQL */ `
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const deleteProfile = /* GraphQL */ `
  mutation DeleteProfile(
    $input: DeleteProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    deleteProfile(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
      data
      __typename
    }
  }
`;
export const createLogging = /* GraphQL */ `
  mutation CreateLogging(
    $input: CreateLoggingInput!
    $condition: ModelLoggingConditionInput
  ) {
    createLogging(input: $input, condition: $condition) {
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
export const updateLogging = /* GraphQL */ `
  mutation UpdateLogging(
    $input: UpdateLoggingInput!
    $condition: ModelLoggingConditionInput
  ) {
    updateLogging(input: $input, condition: $condition) {
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
export const deleteLogging = /* GraphQL */ `
  mutation DeleteLogging(
    $input: DeleteLoggingInput!
    $condition: ModelLoggingConditionInput
  ) {
    deleteLogging(input: $input, condition: $condition) {
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
