import { describe, expect, it } from "vitest"
import {
  NFeDistribuicao,
  NFeRecepcaoEvento,
  createNFeDistribuicao,
  createNFeRecepcaoEvento,
} from "../src/api"
import type {
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
} from "../src/schema"

describe(`API Exports`, () => {
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

  describe(`NFeDistribuicao`, () => {
    it(`should export NFeDistribuicao class`, () => {
      expect(NFeDistribuicao).toBeDefined()
      expect(typeof NFeDistribuicao).toBe(`function`)
    })

    it(`should export createNFeDistribuicao factory function`, () => {
      expect(createNFeDistribuicao).toBeDefined()
      expect(typeof createNFeDistribuicao).toBe(`function`)
    })

    it(`should create NFeDistribuicao instance`, () => {
      const instance = createNFeDistribuicao(mockDistribuicaoConfig)
      expect(instance).toBeInstanceOf(NFeDistribuicao)
      expect(instance.consultaUltNSU).toBeDefined()
      expect(instance.consultaChNFe).toBeDefined()
      expect(instance.consultaNSU).toBeDefined()
    })
  })

  describe(`NFeRecepcaoEvento`, () => {
    it(`should export NFeRecepcaoEvento class`, () => {
      expect(NFeRecepcaoEvento).toBeDefined()
      expect(typeof NFeRecepcaoEvento).toBe(`function`)
    })

    it(`should export createNFeRecepcaoEvento factory function`, () => {
      expect(createNFeRecepcaoEvento).toBeDefined()
      expect(typeof createNFeRecepcaoEvento).toBe(`function`)
    })

    it(`should create NFeRecepcaoEvento instance`, () => {
      const instance = createNFeRecepcaoEvento(mockRecepcaoConfig)
      expect(instance).toBeInstanceOf(NFeRecepcaoEvento)
      expect(instance.enviarEvento).toBeDefined()
    })
  })
})
