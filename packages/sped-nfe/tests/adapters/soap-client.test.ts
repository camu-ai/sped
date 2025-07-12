import { beforeEach, describe, expect, it, vi } from "vitest"
import { sendSoapRequest } from "../../src/adapters/soap-client"
import type { NFeDistribuicaoConfig } from "../../src/schema"

// Mock Node.js modules
vi.mock(`node:https`, () => ({
  default: {
    Agent: vi.fn().mockImplementation(() => ({})),
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe(`soap-client`, () => {
  const mockConfig: NFeDistribuicaoConfig = {
    cUFAutor: `41`,
    cnpj: `12345678901234`,
    tpAmb: `2`,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe(`sendSoapRequest`, () => {
    it(`should send SOAP request with HTTPS agent`, async () => {
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue(`<soap:response/>`),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await sendSoapRequest({
        xml: `<soap:request/>`,
        config: mockConfig,
        endpoint: `NFeDistribuicaoDFe`,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://hom.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx`,
        expect.objectContaining({
          method: `POST`,
          headers: {
            "Content-Type": `application/soap+xml; charset=utf-8`,
            SOAPAction: ``,
          },
          body: `<soap:request/>`,
          agent: expect.any(Object),
        })
      )

      expect(result).toEqual({
        data: `<soap:response/>`,
        status: 200,
      })
    })

    it(`should use production URL when tpAmb is 1`, async () => {
      const prodConfig = { ...mockConfig, tpAmb: `1` as const }
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue(`<soap:response/>`),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await sendSoapRequest({
        xml: `<soap:request/>`,
        config: prodConfig,
        endpoint: `NFeDistribuicaoDFe`,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx`,
        expect.objectContaining({
          agent: expect.any(Object),
        })
      )
    })

    it(`should use correct endpoint for NFeRecepcaoEvento`, async () => {
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue(`<soap:response/>`),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await sendSoapRequest({
        xml: `<soap:request/>`,
        config: mockConfig,
        endpoint: `NFeRecepcaoEvento`,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://hom.nfe.fazenda.gov.br/NFeRecepcaoEvento/NFeRecepcaoEvento.asmx`,
        expect.objectContaining({
          agent: expect.any(Object),
        })
      )
    })

    it(`should handle fetch errors`, async () => {
      mockFetch.mockRejectedValue(new Error(`Network error`))

      await expect(
        sendSoapRequest({
          xml: `<soap:request/>`,
          config: mockConfig,
          endpoint: `NFeDistribuicaoDFe`,
        })
      ).rejects.toThrow(`SOAP request error: Network error`)
    })

    it(`should handle unknown endpoints`, async () => {
      await expect(
        sendSoapRequest({
          xml: `<soap:request/>`,
          config: mockConfig,
          endpoint: `UnknownEndpoint` as any,
        })
      ).rejects.toThrow(`Unknown endpoint: UnknownEndpoint`)
    })

    it(`should throw error when no certificate is provided`, async () => {
      const configWithoutCert = {
        ...mockConfig,
        pfx: undefined,
        passphrase: undefined,
        cert: undefined,
        key: undefined,
      }

      await expect(
        sendSoapRequest({
          xml: `<soap:request/>`,
          config: configWithoutCert,
          endpoint: `NFeDistribuicaoDFe`,
        })
      ).rejects.toThrow(
        `Certificate configuration required: provide either PFX with passphrase or cert and key files`
      )
    })

    it(`should work with cert and key instead of PFX`, async () => {
      const configWithCertKey = {
        ...mockConfig,
        pfx: undefined,
        passphrase: undefined,
        cert: `cert-content`,
        key: `key-content`,
      }

      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue(`<soap:response/>`),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await sendSoapRequest({
        xml: `<soap:request/>`,
        config: configWithCertKey,
        endpoint: `NFeDistribuicaoDFe`,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          agent: expect.any(Object),
        })
      )

      expect(result).toEqual({
        data: `<soap:response/>`,
        status: 200,
      })
    })
  })
})
