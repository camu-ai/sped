import { describe, expect, it } from "vitest"
import {
  validateChNFe,
  validateDistribuicaoConfig,
  validateNSU,
  validateRecepcaoEventoConfig,
  validateUltNSU,
} from "../../src/logic/validation"
import { Ambiente, UFCode } from "../../src/schema"
import type {
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
} from "../../src/schema"

describe(`validation`, () => {
  describe(`validateDistribuicaoConfig`, () => {
    const validConfig: NFeDistribuicaoConfig = {
      cUFAutor: UFCode.PR,
      cnpj: `12345678901234`,
      tpAmb: Ambiente.HOMOLOGACAO,
      pfx: Buffer.from(`test`),
      passphrase: `test`,
    }

    it(`should validate valid config`, () => {
      expect(() => validateDistribuicaoConfig(validConfig)).not.toThrow()
    })

    it(`should throw error when cUFAutor is missing`, () => {
      const config = { ...validConfig, cUFAutor: `` }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `cUFAutor is required`
      )
    })

    it(`should throw error when both CNPJ and CPF are missing`, () => {
      const config = { ...validConfig, cnpj: undefined }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `CNPJ or CPF must be provided`
      )
    })

    it(`should throw error when both CNPJ and CPF are provided`, () => {
      const config = { ...validConfig, cpf: `12345678901` }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `Provide either CNPJ or CPF, not both`
      )
    })

    it(`should throw error when tpAmb is invalid`, () => {
      const config = { ...validConfig, tpAmb: `3` as any }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `tpAmb must be "1" (Production) or "2" (Homologation)`
      )
    })

    it(`should throw error when certificate is missing`, () => {
      const config = { ...validConfig, pfx: undefined }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `Certificate configuration required: provide either PFX with passphrase or cert and key files`
      )
    })

    it(`should accept cert and key instead of pfx`, () => {
      const config = {
        ...validConfig,
        pfx: undefined,
        cert: `cert-content`,
        key: `key-content`,
      }
      expect(() => validateDistribuicaoConfig(config)).not.toThrow()
    })

    it(`should throw error for invalid CNPJ format`, () => {
      const config = { ...validConfig, cnpj: `123` }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `CNPJ must contain 14 numeric digits`
      )
    })

    it(`should throw error for invalid CPF format`, () => {
      const config = {
        ...validConfig,
        cnpj: undefined,
        cpf: `123`,
      }
      expect(() => validateDistribuicaoConfig(config)).toThrow(
        `CPF must contain 11 numeric digits`
      )
    })
  })

  describe(`validateRecepcaoEventoConfig`, () => {
    const validConfig: NFeRecepcaoEventoConfig = {
      cnpj: `12345678901234`,
      tpAmb: `2`,
      pfx: Buffer.from(`test`),
      passphrase: `test`,
    }

    it(`should validate valid config`, () => {
      expect(() => validateRecepcaoEventoConfig(validConfig)).not.toThrow()
    })

    it(`should throw error when both CNPJ and CPF are missing`, () => {
      const config = { ...validConfig, cnpj: undefined }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `CNPJ or CPF must be provided`
      )
    })

    it(`should throw error when both CNPJ and CPF are provided`, () => {
      const config = { ...validConfig, cpf: `12345678901` }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `Provide either CNPJ or CPF, not both`
      )
    })

    it(`should throw error when tpAmb is invalid`, () => {
      const config = { ...validConfig, tpAmb: `3` as any }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `tpAmb must be "1" (Production) or "2" (Homologation)`
      )
    })

    it(`should throw error when certificate is missing`, () => {
      const config = { ...validConfig, pfx: undefined }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `Certificate configuration required: provide either PFX with passphrase or cert and key files`
      )
    })

    it(`should throw error for invalid CNPJ format`, () => {
      const config = { ...validConfig, cnpj: `123` }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `CNPJ must contain 14 numeric digits`
      )
    })

    it(`should throw error for invalid CPF format`, () => {
      const config = {
        ...validConfig,
        cnpj: undefined,
        cpf: `123`,
      }
      expect(() => validateRecepcaoEventoConfig(config)).toThrow(
        `CPF must contain 11 numeric digits`
      )
    })
  })

  describe(`validateUltNSU`, () => {
    it(`should validate valid ultNSU`, () => {
      expect(() => validateUltNSU(`000000000000001`)).not.toThrow()
    })

    it(`should throw error for invalid ultNSU`, () => {
      expect(() => validateUltNSU(`123`)).toThrow(
        `ultNSU must contain 15 numeric digits`
      )
    })
  })

  describe(`validateNSU`, () => {
    it(`should validate valid NSU`, () => {
      expect(() => validateNSU(`000000000000001`)).not.toThrow()
    })

    it(`should throw error for invalid NSU`, () => {
      expect(() => validateNSU(`123`)).toThrow(
        `NSU must contain 15 numeric digits`
      )
    })
  })

  describe(`validateChNFe`, () => {
    it(`should validate valid chNFe`, () => {
      expect(() =>
        validateChNFe(`41000000000000000000000000000000000000000039`)
      ).not.toThrow()
    })

    it(`should throw error for invalid chNFe`, () => {
      expect(() => validateChNFe(`123`)).toThrow(
        `chNFe must contain 44 numeric digits`
      )
    })
  })
})
