import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: [
      "src/features/library/ui/PlaybookPrintDocument.tsx",
      "src/features/library/ui/PlaybookPrintSettingsPanel.tsx",
      "src/features/library/ui/PlayDetailsModal.tsx",
      "src/features/library/ui/FdAppHeader.tsx",
      "src/features/practice/ui/PracticePrintDocument.tsx",
      "src/features/practice/ui/PracticeSheetDocument.tsx",
      "src/features/settings/ui/AppearanceSettingsSection.tsx",
      "src/features/settings/ui/ClubLogoUpload.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/pdf.worker.min.mjs",
    "server.js",
    "scripts/tmp-**",
    "src/shared/lib/fastdraw/legacy/**",
    "lint-report.json",
    "project-analysis.json",
  ]),
]);

export default eslintConfig;
