export async function GET() {
  return Response.json({
    scraping: !!process.env.APIFY_TOKEN,
    model: !!process.env.OPENROUTER_API_KEY,
    accessCodeRequired: !!process.env.LAB_ACCESS_CODE,
  });
}
