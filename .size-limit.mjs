export default [
  {
    name: "Main JS (entry)",
    path: "dist/assets/index-*.js",
    limit: "105 kB",
    gzip: true,
  },
  {
    name: "Vendor React",
    path: "dist/assets/vendor-react-*.js",
    limit: "260 kB",
    gzip: true,
  },
  {
    name: "Vendor Supabase",
    path: "dist/assets/vendor-api-*.js",
    limit: "210 kB",
    gzip: true,
  },
  {
    name: "Vendor Markdown",
    path: "dist/assets/vendor-markdown-*.js",
    limit: "120 kB",
    gzip: true,
  },
  {
    name: "Vendor Router",
    path: "dist/assets/vendor-router-*.js",
    limit: "95 kB",
    gzip: true,
  },
  {
    name: "Vendor Zod",
    path: "dist/assets/vendor-zod-*.js",
    limit: "60 kB",
    gzip: true,
  },
  {
    name: "Vendor Icons",
    path: "dist/assets/vendor-icons-*.js",
    limit: "32 kB",
    gzip: true,
  },
];
