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

export const GET_FEATURED = gql`
  query GetFeatured($limit: Int) {
    featuredCompanions(limit: $limit) {
      id
      name
      age
      tagline
      city
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
