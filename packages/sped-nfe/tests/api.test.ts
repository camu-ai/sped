import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  nfeConsultaChNFe,
  nfeConsultaNSU,
  nfeConsultaUltNSU,
  nfeEnviarEvento,
} from "../src/api"

import { createNFeDistribuicao } from "../src/controllers/nfe-distribuicao-controller"
import { createNFeRecepcaoEvento } from "../src/controllers/nfe-recepcao-evento-controller"
import type {
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
} from "../src/schema"

// Mock the controllers
vi.mock(`../src/controllers/nfe-distribuicao-controller`, () => ({
  createNFeDistribuicao: vi.fn(),
}))

vi.mock(`../src/controllers/nfe-recepcao-evento-controller`, () => ({
  createNFeRecepcaoEvento: vi.fn(),
}))

describe(`API`, () => {
  const mockDistribuicaoConfig: NFeDistribuicaoConfig = {
    cUFAutor: `41`,
    cnpj: `12345678901234`,
    tpAmb: `2`,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  const mockRecepcaoConfig: NFeRecepcaoEventoConfig = {
    cnpj: `12345678901234`,
    tpAmb: `2`,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  const mockDistribuicaoInstance = {
    consultaUltNSU: vi.fn(),
    consultaChNFe: vi.fn(),
    consultaNSU: vi.fn(),
  }

  const mockRecepcaoInstance = {
    enviarEvento: vi.fn(),
  }

  const mockResponse = {
    data: {
      tpAmb: `2`,
      verAplic: `1.5.11`,
      cStat: `138`,
      xMotivo: `Sucesso`,
      dhResp: `2022-06-21T10:48:14-03:00`,
      ultNSU: `000000000000050`,
      maxNSU: `000000000000212`,
    },
    status: 200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createNFeDistribuicao).mockReturnValue(
      mockDistribuicaoInstance as any
    )
    vi.mocked(createNFeRecepcaoEvento).mockReturnValue(
      mockRecepcaoInstance as any
    )
    mockDistribuicaoInstance.consultaUltNSU.mockResolvedValue(mockResponse)
    mockDistribuicaoInstance.consultaChNFe.mockResolvedValue(mockResponse)
    mockDistribuicaoInstance.consultaNSU.mockResolvedValue(mockResponse)
    mockRecepcaoInstance.enviarEvento.mockResolvedValue(mockResponse)
  })

  describe(`nfeConsultaUltNSU`, () => {
    it(`should create distribuicao instance and call consultaUltNSU`, async () => {
      const result = await nfeConsultaUltNSU({
        config: mockDistribuicaoConfig,
        ultNSU: `000000000000001`,
      })

      expect(createNFeDistribuicao).toHaveBeenCalledWith(mockDistribuicaoConfig)
      expect(mockDistribuicaoInstance.consultaUltNSU).toHaveBeenCalledWith({
        ultNSU: `000000000000001`,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe(`nfeConsultaChNFe`, () => {
    it(`should create distribuicao instance and call consultaChNFe`, async () => {
      const result = await nfeConsultaChNFe({
        config: mockDistribuicaoConfig,
        chNFe: `41000000000000000000000000000000000000000039`,
      })

      expect(createNFeDistribuicao).toHaveBeenCalledWith(mockDistribuicaoConfig)
      expect(mockDistribuicaoInstance.consultaChNFe).toHaveBeenCalledWith({
        chNFe: `41000000000000000000000000000000000000000039`,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe(`nfeConsultaNSU`, () => {
    it(`should create distribuicao instance and call consultaNSU`, async () => {
      const result = await nfeConsultaNSU({
        config: mockDistribuicaoConfig,
        NSU: `000000000000001`,
      })

      expect(createNFeDistribuicao).toHaveBeenCalledWith(mockDistribuicaoConfig)
      expect(mockDistribuicaoInstance.consultaNSU).toHaveBeenCalledWith({
        NSU: `000000000000001`,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe(`nfeEnviarEvento`, () => {
    it(`should create recepcao instance and call enviarEvento`, async () => {
      const lote = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: 210200 as const,
        },
      ]

      const result = await nfeEnviarEvento({
        config: mockRecepcaoConfig,
        idLote: `1`,
        lote,
      })

      expect(createNFeRecepcaoEvento).toHaveBeenCalledWith(mockRecepcaoConfig)
      expect(mockRecepcaoInstance.enviarEvento).toHaveBeenCalledWith({
        idLote: `1`,
        lote,
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
