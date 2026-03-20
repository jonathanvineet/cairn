/**
 * DEPRECATED: DEBUG ENDPOINT - Database eliminated
 * Test drones must now be created via the blockchain contract
 * Use POST /api/drones/register instead
 */
export async function POST(request: Request) {
  return Response.json(
    { 
      success: false, 
      error: "Deprecated: Database eliminated",
      message: "Test drones must be created via POST /api/drones/register which writes to the smart contract"
    },
    { status: 501 }
  );
}
