import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    companions(input: CompanionsInput): CompanionConnection!
    companion(id: ID!): Companion
    categories: [Category!]!
    featuredCompanions(limit: Int): [Companion!]!
  }

  input CompanionsInput {
    cursor: String
    limit: Int
    city: String
    category: String
    ethnicity: String
    bodyType: String
    hairColor: String
    ageMin: Int
    ageMax: Int
    priceMin: Int
    priceMax: Int
    verified: Boolean
    sortBy: SortBy
  }

  enum SortBy {
    NEWEST
    RATING
    PRICE_LOW
    PRICE_HIGH
  }

  type CompanionConnection {
    edges: [Companion!]!
    nextCursor: String
    hasMore: Boolean!
    totalCount: Int!
  }

  type Companion {
    id: ID!
    name: String!
    age: Int!
    bio: String
    tagline: String
    ethnicity: String
    bodyType: String
    hairColor: String
    eyeColor: String
    height: Int
    languages: [String!]!
    services: [String!]!
    availability: String
    city: String!
    region: String
    country: String!
    pricePerHour: Int
    currency: String!
    rating: Float!
    reviewCount: Int!
    verified: Boolean!
    featured: Boolean!
    primaryImage: CompanionImage
    images: [CompanionImage!]!
    categories: [Category!]!
    createdAt: String!
  }

  type CompanionImage {
    id: ID!
    position: Int!
    thumbUrl: String!
    mediumUrl: String!
    fullUrl: String!
    width: Int!
    height: Int!
    blurHash: String
    isPrimary: Boolean!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    count: Int!
  }
`;
