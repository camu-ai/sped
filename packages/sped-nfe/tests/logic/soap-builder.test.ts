import { describe, expect, it } from "vitest"
import {
  buildDistribuicaoRequest,
  buildEventoRequest,
} from "../../src/logic/soap-builder"
import { Ambiente, TipoEvento, UFCode } from "../../src/schema"
import type {
  EventoLote,
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
} from "../../src/schema"

describe(`soap-builder`, () => {
  const distribuicaoConfig: NFeDistribuicaoConfig = {
    cUFAutor: UFCode.PR,
    cnpj: `12345678901234`,
    tpAmb: Ambiente.HOMOLOGACAO,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  const recepcaoConfig: NFeRecepcaoEventoConfig = {
    cnpj: `12345678901234`,
    tpAmb: Ambiente.HOMOLOGACAO,
    pfx: Buffer.from(`test`),
    passphrase: `test`,
  }

  describe(`buildDistribuicaoRequest`, () => {
    it(`should build distNSU request with CNPJ`, () => {
      const xml = buildDistribuicaoRequest({
        type: `distNSU`,
        config: distribuicaoConfig,
        params: { ultNSU: `000000000000001` },
      })

      expect(xml).toContain(`<CNPJ>12345678901234</CNPJ>`)
      expect(xml).toContain(
        `<distNSU><ultNSU>000000000000001</ultNSU></distNSU>`
      )
      expect(xml).toContain(`<tpAmb>2</tpAmb>`)
      expect(xml).toContain(`<cUFAutor>41</cUFAutor>`)
    })

    it(`should build consNSU request`, () => {
      const xml = buildDistribuicaoRequest({
        type: `consNSU`,
        config: distribuicaoConfig,
        params: { NSU: `000000000000001` },
      })

      expect(xml).toContain(`<consNSU><NSU>000000000000001</NSU></consNSU>`)
    })

    it(`should build consChNFe request`, () => {
      const xml = buildDistribuicaoRequest({
        type: `consChNFe`,
        config: distribuicaoConfig,
        params: { chNFe: `41000000000000000000000000000000000000000039` },
      })

      expect(xml).toContain(
        `<consChNFe><chNFe>41000000000000000000000000000000000000000039</chNFe></consChNFe>`
      )
    })

    it(`should build request with CPF instead of CNPJ`, () => {
      const configWithCpf = {
        ...distribuicaoConfig,
        cnpj: undefined,
        cpf: `12345678901`,
      }

      const xml = buildDistribuicaoRequest({
        type: `distNSU`,
        config: configWithCpf,
        params: { ultNSU: `000000000000001` },
      })

      expect(xml).toContain(`<CPF>12345678901</CPF>`)
      expect(xml).not.toContain(`<CNPJ>`)
    })
  })

  describe(`buildEventoRequest`, () => {
    it(`should build evento request with single event`, () => {
      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: TipoEvento.CONFIRMACAO_OPERACAO,
        },
      ]

      const xml = buildEventoRequest({
        config: recepcaoConfig,
        idLote: `1`,
        lote,
      })

      expect(xml).toContain(`<idLote>1</idLote>`)
      expect(xml).toContain(`<CNPJ>12345678901234</CNPJ>`)
      expect(xml).toContain(
        `<chNFe>41000000000000000000000000000000000000000039</chNFe>`
      )
      expect(xml).toContain(`<tpEvento>210200</tpEvento>`)
      expect(xml).toContain(`<descEvento>Confirmacao da Operacao</descEvento>`)
    })

    it(`should build evento request with justificativa`, () => {
      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: TipoEvento.OPERACAO_NAO_REALIZADA,
          justificativa: `Produto não entregue`,
        },
      ]

      const xml = buildEventoRequest({
        config: recepcaoConfig,
        idLote: `1`,
        lote,
      })

      expect(xml).toContain(`<xJust>Produto não entregue</xJust>`)
      expect(xml).toContain(`<descEvento>Operacao nao Realizada</descEvento>`)
    })

    it(`should build request with CPF instead of CNPJ`, () => {
      const configWithCpf = {
        ...recepcaoConfig,
        cnpj: undefined,
        cpf: `12345678901`,
      }

      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: TipoEvento.CIENCIA_OPERACAO,
        },
      ]

      const xml = buildEventoRequest({
        config: configWithCpf,
        idLote: `1`,
        lote,
      })

      expect(xml).toContain(`<CPF>12345678901</CPF>`)
      expect(xml).not.toContain(`<CNPJ>`)
    })

    it(`should handle multiple events in lote`, () => {
      const lote: Array<EventoLote> = [
        {
          chNFe: `41000000000000000000000000000000000000000039`,
          tpEvento: 210200,
        },
        {
          chNFe: `41000000000000000000000000000000000000000040`,
          tpEvento: 210210,
        },
      ]

      const xml = buildEventoRequest({
        config: recepcaoConfig,
        idLote: `1`,
        lote,
      })

      expect(xml).toContain(`41000000000000000000000000000000000000000039`)
      expect(xml).toContain(`41000000000000000000000000000000000000000040`)
      expect(xml).toContain(`<tpEvento>210200</tpEvento>`)
      expect(xml).toContain(`<tpEvento>210210</tpEvento>`)
    })

    it(`should handle all event types correctly`, () => {
      const eventTypes = [
        { tpEvento: 210200, expectedDesc: `Confirmacao da Operacao` },
        { tpEvento: 210210, expectedDesc: `Ciencia da Operacao` },
        { tpEvento: 210220, expectedDesc: `Desconhecimento da Operacao` },
        { tpEvento: 210240, expectedDesc: `Operacao nao Realizada` },
        { tpEvento: 999999, expectedDesc: `Evento desconhecido` },
      ]

      for (const { tpEvento, expectedDesc } of eventTypes) {
        const lote: Array<EventoLote> = [
          {
            chNFe: `41000000000000000000000000000000000000000039`,
            tpEvento,
          },
        ]

        const xml = buildEventoRequest({
          config: recepcaoConfig,
          idLote: `1`,
          lote,
        })

        expect(xml).toContain(`<descEvento>${expectedDesc}</descEvento>`)
      }
    })
  })
})
