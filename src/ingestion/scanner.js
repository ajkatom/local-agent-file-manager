import fg from "fast-glob";

export async function scanFiles(rootPath) {
  return fg(
    [
      "**/*.txt",
      "**/*.md",
      "**/*.json",
      "**/*.csv",
      "**/*.log",
      "**/*.pdf",
      "**/*.docx",
      "**/*.eml",
      "**/*.xlsx",
      "**/*.xls",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.webp"
    ],
    {
      cwd: rootPath,
      absolute: true,
      dot: true,
      ignore: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.DS_Store"
      ]
    }
  );
}
