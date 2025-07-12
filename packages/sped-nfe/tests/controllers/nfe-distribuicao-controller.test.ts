import { beforeEach, describe, expect, it, vi } from "vitest"
import { NFeDistribuicao } from "../../src/controllers/nfe-distribuicao-controller"

import { sendSoapRequest } from "../../src/adapters/soap-client"
import { parseDistribuicaoResponse } from "../../src/adapters/response-parser"
import { buildDistribuicaoRequest } from "../../src/logic/soap-builder"
import type { NFeDistribuicaoConfig } from "../../src/schema"

// Mock the dependencies
vi.mock(`../../src/adapters/soap-client`, () => ({
  sendSoapRequest: vi.fn(),
}))

vi.mock(`../../src/adapters/response-parser`, () => ({
  parseDistribuicaoResponse: vi.fn(),
}))

vi.mock(`../../src/logic/soap-builder`, () => ({
  buildDistribuicaoRequest: vi.fn(),
}))

describe(`NFeDistribuicao`, () => {
  const validConfig: NFeDistribuicaoConfig = {
    cUFAutor: `41`,
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
      tpAmb: `2`,
      verAplic: `1.5.11`,
      cStat: `138`,
      xMotivo: `Documento(s) localizado(s)`,
      dhResp: `2022-06-21T10:48:14-03:00`,
      ultNSU: `000000000000050`,
      maxNSU: `000000000000212`,
    },
    reqXml: `<request/>`,
    resXml: `<response/>`,
    status: 200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sendSoapRequest).mockResolvedValue(mockSoapResponse)
    vi.mocked(parseDistribuicaoResponse).mockReturnValue(mockParsedResponse)
    vi.mocked(buildDistribuicaoRequest).mockReturnValue(`<request/>`)
  })

  it(`should create instance with valid config`, () => {
    expect(() => new NFeDistribuicao(validConfig)).not.toThrow()
  })

  it(`should throw error with invalid config`, () => {
    const invalidConfig = { ...validConfig, cUFAutor: `` }
    expect(() => new NFeDistribuicao(invalidConfig)).toThrow()
  })

  describe(`consultaUltNSU`, () => {
    it(`should call correct methods and return response`, async () => {
      const distribuicao = new NFeDistribuicao(validConfig)

      const result = await distribuicao.consultaUltNSU({
        ultNSU: `000000000000001`,
      })

      expect(buildDistribuicaoRequest).toHaveBeenCalledWith({
        type: `distNSU`,
        config: validConfig,
        params: { ultNSU: `000000000000001` },
      })

      expect(sendSoapRequest).toHaveBeenCalledWith({
        xml: `<request/>`,
        config: validConfig,
        endpoint: `NFeDistribuicaoDFe`,
      })

      expect(parseDistribuicaoResponse).toHaveBeenCalledWith({
        responseXml: `<response/>`,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result).toEqual(mockParsedResponse)
    })

    it(`should handle errors`, async () => {
      vi.mocked(sendSoapRequest).mockRejectedValue(new Error(`Network error`))

      const distribuicao = new NFeDistribuicao(validConfig)
      const result = await distribuicao.consultaUltNSU({
        ultNSU: `000000000000001`,
      })

      expect(result.error).toBe(`Network error`)
      expect(result.status).toBe(500)
    })
  })

  describe(`consultaChNFe`, () => {
    it(`should call correct methods and return response`, async () => {
      const distribuicao = new NFeDistribuicao(validConfig)

      const result = await distribuicao.consultaChNFe({
        chNFe: `41000000000000000000000000000000000000000039`,
      })

      expect(buildDistribuicaoRequest).toHaveBeenCalledWith({
        type: `consChNFe`,
        config: validConfig,
        params: { chNFe: `41000000000000000000000000000000000000000039` },
      })

      expect(result).toEqual(mockParsedResponse)
    })
  })

  describe(`consultaNSU`, () => {
    it(`should call correct methods and return response`, async () => {
      const distribuicao = new NFeDistribuicao(validConfig)

      const result = await distribuicao.consultaNSU({ NSU: `000000000000001` })

      expect(buildDistribuicaoRequest).toHaveBeenCalledWith({
        type: `consNSU`,
        config: validConfig,
        params: { NSU: `000000000000001` },
      })

      expect(result).toEqual(mockParsedResponse)
    })
  })
})
