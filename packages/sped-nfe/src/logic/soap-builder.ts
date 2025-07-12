import { TipoEvento } from "../schema"
import { normalizeAmbiente, normalizeUFCode } from "./validation"
import type {
  EventoLote,
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
} from "../schema"

interface DistribuicaoRequestParams {
  type: `distNSU` | `consNSU` | `consChNFe`
  config: NFeDistribuicaoConfig
  params: { ultNSU?: string; NSU?: string; chNFe?: string }
}

interface EventoRequestParams {
  config: NFeRecepcaoEventoConfig
  idLote: string
  lote: Array<EventoLote>
}

export const buildDistribuicaoRequest = (
  inputs: DistribuicaoRequestParams
): string => {
  const { type, config, params } = inputs
  const identificacao = config.cnpj
    ? `<CNPJ>${config.cnpj}</CNPJ>`
    : `<CPF>${config.cpf}</CPF>`

  let consultaElement = ``

  switch (type) {
    case `distNSU`:
      consultaElement = `<distNSU><ultNSU>${params.ultNSU}</ultNSU></distNSU>`
      break
    case `consNSU`:
      consultaElement = `<consNSU><NSU>${params.NSU}</NSU></consNSU>`
      break
    case `consChNFe`:
      consultaElement = `<consChNFe><chNFe>${params.chNFe}</chNFe></consChNFe>`
      break
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
      <nfeDadosMsg>
        <distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">
          <tpAmb>${normalizeAmbiente(config.tpAmb)}</tpAmb>
          ${config.cUFAutor ? `<cUFAutor>${normalizeUFCode(config.cUFAutor)}</cUFAutor>` : ``}
          ${identificacao}
          ${consultaElement}
        </distDFeInt>
      </nfeDadosMsg>
    </nfeDistDFeInteresse>
  </soap12:Body>
</soap12:Envelope>`
}

export const buildEventoRequest = (inputs: EventoRequestParams): string => {
  const { config, idLote, lote } = inputs
  const identificacao = config.cnpj ? config.cnpj : config.cpf
  const tipoDoc = config.cnpj ? `CNPJ` : `CPF`

  const eventos = lote
    .map((evento) => {
      const dataEvento = new Date().toISOString()

      const justificativaElement = evento.justificativa
        ? `<detEvento versao="1.00"><descEvento>Operacao nao Realizada</descEvento><xJust>${evento.justificativa}</xJust></detEvento>`
        : `<detEvento versao="1.00"><descEvento>${getDescricaoEvento(evento.tpEvento)}</descEvento></detEvento>`

      return `<evento versao="1.00">
      <infEvento Id="ID${evento.tpEvento}${evento.chNFe}01">
        <cOrgao>91</cOrgao>
        <tpAmb>${normalizeAmbiente(config.tpAmb)}</tpAmb>
        <${tipoDoc}>${identificacao}</${tipoDoc}>
        <chNFe>${evento.chNFe}</chNFe>
        <dhEvento>${dataEvento}</dhEvento>
        <tpEvento>${evento.tpEvento}</tpEvento>
        <nSeqEvento>1</nSeqEvento>
        <verEvento>1.00</verEvento>
        ${justificativaElement}
      </infEvento>
    </evento>`
    })
    .join(``)

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeRecepcaoEvento xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento">
      <nfeDadosMsg>
        <envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
          <idLote>${idLote}</idLote>
          ${eventos}
        </envEvento>
      </nfeDadosMsg>
    </nfeRecepcaoEvento>
  </soap12:Body>
</soap12:Envelope>`
}

const getDescricaoEvento = (tpEvento: TipoEvento | number): string => {
  switch (tpEvento) {
    case TipoEvento.CONFIRMACAO_OPERACAO:
    case 210200:
      return `Confirmacao da Operacao`
    case TipoEvento.CIENCIA_OPERACAO:
    case 210210:
      return `Ciencia da Operacao`
    case TipoEvento.DESCONHECIMENTO_OPERACAO:
    case 210220:
      return `Desconhecimento da Operacao`
    case TipoEvento.OPERACAO_NAO_REALIZADA:
    case 210240:
      return `Operacao nao Realizada`
    default:
      return `Evento desconhecido`
  }
}
