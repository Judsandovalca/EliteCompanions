import { gql } from "@apollo/client/core";

export const GET_COMPANIONS = gql`
  query GetCompanions($input: CompanionsInput) {
    companions(input: $input) {
      edges {
        id
        name
        age
        tagline
        ethnicity
        city
        tags
        pricePerHour
        currency
        rating
        reviewCount
        verified
        featured
        primaryImage {
          id
          thumbUrl
          mediumUrl
          width
          height
          blurHash
        }
      }
      nextCursor
      hasMore
      totalCount
    }
  }
`;

export const GET_COMPANION_DETAIL = gql`
  query GetCompanionDetail($id: ID!) {
    companion(id: $id) {
      id
      name
      age
      bio
      tagline
      ethnicity
      bodyType
      hairColor
      eyeColor
      height
      languages
      services
      tags
      availability
      city
      region
      country
      pricePerHour
      currency
      rating
      reviewCount
      verified
      featured
      images {
        id
        position
        thumbUrl
        mediumUrl
        fullUrl
        width
        height
        blurHash
        isPrimary
      }
      categories {
        id
        name
        slug
      }
      createdAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      count
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const CREATE_COMPANION_MUTATION = gql`
  mutation CreateCompanion($input: CreateCompanionInput!) {
    createCompanion(input: $input) {
      id
    }
  }
`;

export const GET_MY_COMPANIONS = gql`
  query GetMyCompanions {
    myCompanions {
      id
      name
      age
      tagline
      city
      status
      tags
      pricePerHour
      currency
      rating
      reviewCount
      verified
      featured
      primaryImage {
        id
        thumbUrl
        mediumUrl
        width
        height
        blurHash
      }
      categories {
        id
        name
        slug
      }
      createdAt
    }
  }
`;

export const TOGGLE_COMPANION_STATUS = gql`
  mutation ToggleCompanionStatus($id: ID!) {
    toggleCompanionStatus(id: $id) {
      id
      status
    }
  }
`;

export const GET_FEATURED = gql`
  query GetFeatured($limit: Int) {
    featuredCompanions(limit: $limit) {
      id
      name
      age
      tagline
      city
      tags
      rating
      verified
      primaryImage {
        id
        thumbUrl
        mediumUrl
        width
        height
        blurHash
      }
    }
  }
`;
