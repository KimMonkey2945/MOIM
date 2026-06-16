import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Prettier와 충돌하는 포맷팅 규칙을 비활성화
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 빌드 산출물·자동 생성 파일은 린트 대상에서 제외
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "lib/database.types.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // 반드시 마지막에 위치해야 포맷팅 규칙을 확실히 끈다
  eslintConfigPrettier,
];

export default eslintConfig;
