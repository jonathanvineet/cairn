/**
 * DEPRECATED: This endpoint required local database access
 * Use the blockchain contract's updateAgentTopic() function instead
 */
export async function POST(request: Request) {
  return Response.json(
    { 
      success: false, 
      error: "Deprecated: Database eliminated",
      message: "Agent topics are now stored on blockchain contract via updateAgentTopic(). Call this function directly with contract write transactions."
    },
    { status: 501 }
  );
}
