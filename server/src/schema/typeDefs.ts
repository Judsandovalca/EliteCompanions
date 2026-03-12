import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    companions(input: CompanionsInput): CompanionConnection!
    companion(id: ID!): Companion
    categories: [Category!]!
    featuredCompanions(limit: Int): [Companion!]!
    me: User
    myCompanions: [Companion!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    createCompanion(input: CreateCompanionInput!): Companion!
    toggleCompanionStatus(id: ID!): Companion!
  }

  input CreateCompanionInput {
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
    tags: [String!]
    availability: String
    city: String!
    region: String
    country: String!
    pricePerHour: Int
    currency: String
    categoryIds: [String!]!
    images: [CompanionImageInput!]!
  }

  input CompanionImageInput {
    position: Int!
    s3Key: String!
    thumbUrl: String!
    mediumUrl: String!
    fullUrl: String!
    width: Int!
    height: Int!
    blurHash: String
    isPrimary: Boolean!
  }

  input RegisterInput {
    email: String!
    name: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
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
    tag: String
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
    tags: [String!]!
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
    status: String!
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
