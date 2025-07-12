// Enums para facilitar o uso
export enum UFCode {
  RO = `11`, // Rondônia
  AC = `12`, // Acre
  AM = `13`, // Amazonas
  RR = `14`, // Roraima
  PA = `15`, // Pará
  AP = `16`, // Amapá
  TO = `17`, // Tocantins
  MA = `21`, // Maranhão
  PI = `22`, // Piauí
  CE = `23`, // Ceará
  RN = `24`, // Rio Grande do Norte
  PB = `25`, // Paraíba
  PE = `26`, // Pernambuco
  AL = `27`, // Alagoas
  SE = `28`, // Sergipe
  BA = `29`, // Bahia
  MG = `31`, // Minas Gerais
  ES = `32`, // Espírito Santo
  RJ = `33`, // Rio de Janeiro
  SP = `35`, // São Paulo
  PR = `41`, // Paraná
  SC = `42`, // Santa Catarina
  RS = `43`, // Rio Grande do Sul
  MS = `50`, // Mato Grosso do Sul
  MT = `51`, // Mato Grosso
  GO = `52`, // Goiás
  DF = `53`, // Distrito Federal
}

export enum Ambiente {
  PRODUCAO = `1`,
  HOMOLOGACAO = `2`,
}

export enum TipoEvento {
  CONFIRMACAO_OPERACAO = 210200,
  CIENCIA_OPERACAO = 210210,
  DESCONHECIMENTO_OPERACAO = 210220,
  OPERACAO_NAO_REALIZADA = 210240,
}

export interface NFeDistribuicaoConfig {
  pfx?: Buffer
  passphrase?: string
  cert?: Buffer | string
  key?: Buffer | string
  cUFAutor: UFCode | string
  cnpj?: string
  cpf?: string
  tpAmb: Ambiente | `1` | `2`
  options?: {
    requestOptions?: any
    httpsOptions?: any
  }
}

export interface NFeRecepcaoEventoConfig {
  pfx?: Buffer
  passphrase?: string
  cert?: Buffer | string
  key?: Buffer | string
  cnpj?: string
  cpf?: string
  tpAmb: Ambiente | `1` | `2`
  timezone?: string
  options?: {
    requestOptions?: any
    httpsOptions?: any
  }
}

export interface ConsultaUltNSUInput {
  config: NFeDistribuicaoConfig
  ultNSU: string
}

export interface ConsultaChNFeInput {
  config: NFeDistribuicaoConfig
  chNFe: string
}

export interface ConsultaNSUInput {
  config: NFeDistribuicaoConfig
  NSU: string
}

export interface EventoLote {
  chNFe: string
  tpEvento: TipoEvento | 210200 | 210210 | 210220 | 210240
  justificativa?: string
}

export interface EnviarEventoInput {
  config: NFeRecepcaoEventoConfig
  idLote: string
  lote: Array<EventoLote>
}

export interface DocZip {
  xml: string
  json: any
  nsu: string
  schema: string
}

export interface DistribuicaoResponse {
  data?: {
    tpAmb: string
    verAplic: string
    cStat: string
    xMotivo: string
    dhResp: string
    ultNSU: string
    maxNSU: string
    docZip?: Array<DocZip>
  }
  reqXml?: string
  resXml?: string
  status?: number
  error?: string
}

export interface InfEvento {
  tpAmb: string
  verAplic: string
  cOrgao: string
  cStat: string
  xMotivo: string
  chNFe: string
  tpEvento: string
  xEvento: string
  nSeqEvento: string
  CNPJDest: string
  dhRegEvento: string
  nProt: string
}

export interface EventoResponse {
  data?: {
    idLote: string
    tpAmb: string
    verAplic: string
    cOrgao: string
    cStat: string
    xMotivo: string
    infEvento?: Array<InfEvento>
  }
  reqXml?: string
  resXml?: string
  status?: number
  error?: string
}

export interface ResNFe {
  chNFe: string
  CNPJ?: string
  CPF?: string
  xNome: string
  IE: string
  dhEmi: string
  tpNF: `0` | `1`
  vNF: string
  digVal?: string
  dhRecbto: string
  nProt: string
  cSitNFe: `1` | `2` | `3`
}

export interface ResEvento {
  cOrgao: string
  CNPJ?: string
  CPF?: string
  chNFe: string
  dhEvento: string
  tpEvento: string
  nSeqEvento: string
  xEvento: string
  dhRecbto: string
  nProt: string
}
