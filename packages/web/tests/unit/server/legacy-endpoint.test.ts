import { describe, expect, it } from "vitest";
import {
  createLegacyEndpointDeprecatedError,
  legacyEndpointDeprecatedHandler,
} from "../../../server/utils/legacy-endpoint";

describe("legacy endpoint deprecation", () => {
  it("crea error 410 Gone con mensaje de migración", () => {
    const error = createLegacyEndpointDeprecatedError("/api/profile/:id");

    expect(error.statusCode).toBe(410);
    expect(error.statusMessage).toBe("Gone");
    expect(error.message).toContain("Legacy endpoint deprecado");
    expect(error.message).toContain("/api/v1/");
  });

  it("handler legacy siempre rechaza endpoint con 410", async () => {
    const handler = legacyEndpointDeprecatedHandler("/api/party/:partyId/lists");

    expect(() => handler({} as never)).toThrowError(/Legacy endpoint deprecado/);
  });

  it("quests legacy también responde 410", async () => {
    const handler = legacyEndpointDeprecatedHandler("/api/quests");

    expect(() => handler({} as never)).toThrowError(/Legacy endpoint deprecado/);
  });
});
