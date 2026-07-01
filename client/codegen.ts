import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/graphql",
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/api/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-rtk-query"],
      config: {
        importBaseApiFrom: "../store/baseApi",
        exportHooks: true,
        scalars: { DateTime: "string" },
        enumsAsConst: true,
      },
    },
  },
};

export default config;
