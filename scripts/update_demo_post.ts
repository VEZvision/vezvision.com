const postSlug = process.argv[2];
if (!postSlug) {
  console.error('Usage: npx tsx scripts/update_demo_post.ts <slug>');
  process.exit(1);
}
console.log(`Slug provided: ${postSlug}`);
