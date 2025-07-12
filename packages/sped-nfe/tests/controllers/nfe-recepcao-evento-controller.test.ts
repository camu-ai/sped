import { beforeEach, describe, expect, it, vi } from "vitest"
import { NFeRecepcaoEvento } from "../../src/controllers/nfe-recepcao-evento-controller"

import { sendSoapRequest } from "../../src/adapters/soap-client"
import { parseEventoResponse } from "../../src/adapters/response-parser"
import { buildEventoRequest } from "../../src/logic/soap-builder"
import type { EventoLote, NFeRecepcaoEventoConfig } from "../../src/schema"

// Mock the dependencies
vi.mock(`../../src/adapters/soap-client`, () => ({
  sendSoapRequest: vi.fn(),
}))

vi.mock(`../../src/adapters/response-parser`, () => ({
  parseEventoResponse: vi.fn(),
}))

vi.mock(`../../src/logic/soap-builder`, () => ({
  buildEventoRequest: vi.fn(),
}))

describe(`NFeRecepcaoEvento`, () => {
  const validConfig: NFeRecepcaoEventoConfig = {
    cnpj: `12345678901234`,
    tpAmb: `2`,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  const mockSoapResponse = {
    data: `<response/>`,
    status: 200,
  }

  const mockParsedResponse = {
    data: {
      idLote: `1337`,
      tpAmb: `2`,
      verAplic: `AN_1.4.3`,
      cOrgao: `91`,
      cStat: `128`,
      xMotivo: `Lote de evento processado`,
    },
    reqXml: `<request/>`,
    resXml: `<response/>`,
    status: 200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sendSoapRequest).mockResolvedValue(mockSoapResponse)
    vi.mocked(parseEventoResponse).mockReturnValue(mockParsedResponse)
    vi.mocked(buildEventoRequest).mockReturnValue(`<request/>`)
  })

  it(`should create instance with valid config`, () => {
    expect(() => new NFeRecepcaoEvento(validConfig)).not.toThrow()
  })

  it(`should throw error with invalid config`, () => {
    const invalidConfig = { ...validConfig, cnpj: undefined }
    expect(() => new NFeRecepcaoEvento(invalidConfig)).toThrow()
  })

  describe(`enviarEvento`, () => {
    it(`should call correct methods and return response`, async () => {
      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: 210200,
        },
      ]

      const recepcaoEvento = new NFeRecepcaoEvento(validConfig)

      const result = await recepcaoEvento.enviarEvento({
        idLote: `1337`,
        lote,
      })

      expect(buildEventoRequest).toHaveBeenCalledWith({
        config: validConfig,
        idLote: `1337`,
        lote,
      })

      expect(sendSoapRequest).toHaveBeenCalledWith({
        xml: `<request/>`,
        config: validConfig,
        endpoint: `NFeRecepcaoEvento`,
      })

      expect(parseEventoResponse).toHaveBeenCalledWith({
        responseXml: `<response/>`,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result).toEqual(mockParsedResponse)
    })

    it(`should handle errors`, async () => {
      vi.mocked(sendSoapRequest).mockRejectedValue(new Error(`Network error`))

      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: 210200,
        },
      ]

      const recepcaoEvento = new NFeRecepcaoEvento(validConfig)
      const result = await recepcaoEvento.enviarEvento({
        idLote: `1337`,
        lote,
      })

      expect(result.error).toBe(`Network error`)
      expect(result.status).toBe(500)
    })
  })
})
