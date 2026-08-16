// Every API handler answers through this helper so the wire shape stays uniform.
export function respondWithJSON(status: number, payload: unknown): Response {
  return Response.json(payload ?? null, { status });
}
