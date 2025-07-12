import { describe, expect, it } from "vitest"
import {
  parseDistribuicaoResponse,
  parseEventoResponse,
} from "../../src/adapters/response-parser"

describe(`response-parser`, () => {
  describe(`parseDistribuicaoResponse`, () => {
    it(`should parse successful distribuicao response`, () => {
      const responseXml = `
        <retDistDFeInt>
          <tpAmb>2</tpAmb>
          <verAplic>1.5.11</verAplic>
          <cStat>138</cStat>
          <xMotivo>Documento(s) localizado(s)</xMotivo>
          <dhResp>2022-06-21T10:48:14-03:00</dhResp>
          <ultNSU>000000000000050</ultNSU>
          <maxNSU>000000000000212</maxNSU>
          <loteDistDFeInt>
            <docZip NSU="000000000000049" schema="resNFe_v1.01.xsd">base64content</docZip>
          </loteDistDFeInt>
        </retDistDFeInt>
      `

      const result = parseDistribuicaoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data).toBeDefined()
      expect(result.data?.tpAmb).toBe(`2`)
      expect(result.data?.cStat).toBe(`138`)
      expect(result.data?.xMotivo).toBe(`Documento(s) localizado(s)`)
      expect(result.data?.ultNSU).toBe(`000000000000050`)
      expect(result.data?.maxNSU).toBe(`000000000000212`)
      expect(result.data?.docZip).toHaveLength(1)
      expect(result.data?.docZip?.[0].nsu).toBe(`000000000000049`)
      expect(result.data?.docZip?.[0].schema).toBe(`resNFe_v1.01.xsd`)
      expect(result.status).toBe(200)
    })

    it(`should handle response without docZip`, () => {
      const responseXml = `
        <retDistDFeInt>
          <tpAmb>2</tpAmb>
          <verAplic>1.5.11</verAplic>
          <cStat>137</cStat>
          <xMotivo>Nenhum documento localizado</xMotivo>
          <dhResp>2022-06-21T10:48:14-03:00</dhResp>
          <ultNSU>000000000000050</ultNSU>
          <maxNSU>000000000000050</maxNSU>
        </retDistDFeInt>
      `

      const result = parseDistribuicaoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data?.docZip).toBeUndefined()
      expect(result.data?.cStat).toBe(`137`)
    })

    it(`should handle invalid XML`, () => {
      const result = parseDistribuicaoResponse({
        responseXml: `invalid xml`,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })
  })

  describe(`parseEventoResponse`, () => {
    it(`should parse successful evento response`, () => {
      const responseXml = `
        <retEnvEvento>
          <idLote>1337</idLote>
          <tpAmb>2</tpAmb>
          <verAplic>AN_1.4.3</verAplic>
          <cOrgao>91</cOrgao>
          <cStat>128</cStat>
          <xMotivo>Lote de evento processado</xMotivo>
          <retEvento>
            <tpAmb>2</tpAmb>
            <verAplic>AN_1.4.3</verAplic>
            <cOrgao>91</cOrgao>
            <cStat>135</cStat>
            <xMotivo>Evento registrado e vinculado a NF-e</xMotivo>
            <chNFe>41000000000000000000000000000000000000000041</chNFe>
            <tpEvento>210240</tpEvento>
            <xEvento>Operacao nao Realizada</xEvento>
            <nSeqEvento>1</nSeqEvento>
            <CNPJDest>12345678901234</CNPJDest>
            <dhRegEvento>2022-06-21T11:20:10-03:00</dhRegEvento>
            <nProt>891220000003301</nProt>
          </retEvento>
        </retEnvEvento>
      `

      const result = parseEventoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data).toBeDefined()
      expect(result.data?.idLote).toBe(`1337`)
      expect(result.data?.cStat).toBe(`128`)
      expect(result.data?.xMotivo).toBe(`Lote de evento processado`)
      expect(result.data?.infEvento).toHaveLength(1)
      expect(result.data?.infEvento?.[0].chNFe).toBe(
        `41000000000000000000000000000000000000000041`
      )
      expect(result.data?.infEvento?.[0].tpEvento).toBe(`210240`)
      expect(result.status).toBe(200)
    })

    it(`should handle invalid XML`, () => {
      const result = parseEventoResponse({
        responseXml: `invalid xml`,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    it(`should parse XML with attributes and nested elements`, () => {
      const responseXml = `
        <retEnvEvento>
          <idLote>1337</idLote>
          <tpAmb>2</tpAmb>
          <verAplic>AN_1.4.3</verAplic>
          <cOrgao>91</cOrgao>
          <cStat>128</cStat>
          <xMotivo>Lote de evento processado</xMotivo>
          <retEvento>
            <nested attr="value">
              <child>text content</child>
              <child>another child</child>
            </nested>
          </retEvento>
        </retEnvEvento>
      `

      const result = parseEventoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data).toBeDefined()
      expect(result.status).toBe(200)
    })
  })

  describe(`XML parsing utilities`, () => {
    it(`should handle docZip decompression and parsing errors gracefully`, () => {
      const responseXml = `
        <retDistDFeInt>
          <tpAmb>2</tpAmb>
          <verAplic>1.5.11</verAplic>
          <cStat>138</cStat>
          <xMotivo>Documento(s) localizado(s)</xMotivo>
          <dhResp>2022-06-21T10:48:14-03:00</dhResp>
          <ultNSU>000000000000050</ultNSU>
          <maxNSU>000000000000212</maxNSU>
          <loteDistDFeInt>
            <docZip NSU="000000000000049" schema="resNFe_v1.01.xsd">invalid-base64-content</docZip>
          </loteDistDFeInt>
        </retDistDFeInt>
      `

      const result = parseDistribuicaoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data?.docZip).toHaveLength(1)
      expect(result.data?.docZip?.[0].xml).toBe(`invalid-base64-content`)
      expect(result.data?.docZip?.[0].json).toBeDefined()
    })

    it(`should handle valid base64 XML content`, () => {
      const responseXml = `
        <retDistDFeInt>
          <tpAmb>2</tpAmb>
          <verAplic>1.5.11</verAplic>
          <cStat>138</cStat>
          <xMotivo>Documento(s) localizado(s)</xMotivo>
          <dhResp>2022-06-21T10:48:14-03:00</dhResp>
          <ultNSU>000000000000050</ultNSU>
          <maxNSU>000000000000212</maxNSU>
          <loteDistDFeInt>
            <docZip NSU="000000000000049" schema="resNFe_v1.01.xsd">PHRlc3Q+PG5lc3RlZCBhdHRyPSJ2YWx1ZSI+PHRleHQ+Y29udGVudDwvdGV4dD48L25lc3RlZD48L3Rlc3Q+</docZip>
          </loteDistDFeInt>
        </retDistDFeInt>
      `

      const result = parseDistribuicaoResponse({
        responseXml,
        requestXml: `<request/>`,
        status: 200,
      })

      expect(result.data?.docZip).toHaveLength(1)
      expect(result.data?.docZip?.[0].json).toBeDefined()
    })
  })
})
