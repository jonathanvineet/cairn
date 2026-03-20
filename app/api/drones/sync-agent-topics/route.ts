/**
 * DEPRECATED: This endpoint required local database access
 * Use the blockchain contract's getAllDrones() and updateAgentTopic() instead
 */
export async function POST(request: Request) {
  return Response.json(
    { 
      success: false, 
      error: "Deprecated: Database eliminated",
      message: "Sync agent topics by querying getAllDrones() and calling updateAgentTopic() directly on the contract"
    },
    { status: 501 }
  );
}
