import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          companions: {
            keyArgs: [
              "input",
              ["city", "category", "ethnicity", "bodyType", "hairColor", "ageMin", "ageMax", "priceMin", "priceMax", "verified", "sortBy"],
            ],
            merge(existing, incoming) {
              if (!existing) return incoming;
              const seen = new Set(
                existing.edges.map((e: { __ref?: string }) => e.__ref)
              );
              const newEdges = incoming.edges.filter(
                (e: { __ref?: string }) => !seen.has(e.__ref)
              );
              return {
                ...incoming,
                edges: [...existing.edges, ...newEdges],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
