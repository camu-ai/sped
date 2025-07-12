import { createNFeDistribuicao } from "./controllers/nfe-distribuicao-controller"
import { createNFeRecepcaoEvento } from "./controllers/nfe-recepcao-evento-controller"
import type {
  ConsultaChNFeInput,
  ConsultaNSUInput,
  ConsultaUltNSUInput,
  DistribuicaoResponse,
  EnviarEventoInput,
  EventoResponse,
} from "./schema"

export const nfeConsultaUltNSU = async (
  inputs: ConsultaUltNSUInput
): Promise<DistribuicaoResponse> => {
  const distribuicao = createNFeDistribuicao(inputs.config)
  return distribuicao.consultaUltNSU({ ultNSU: inputs.ultNSU })
}

export const nfeConsultaChNFe = async (
  inputs: ConsultaChNFeInput
): Promise<DistribuicaoResponse> => {
  const distribuicao = createNFeDistribuicao(inputs.config)
  return distribuicao.consultaChNFe({ chNFe: inputs.chNFe })
}

export const nfeConsultaNSU = async (
  inputs: ConsultaNSUInput
): Promise<DistribuicaoResponse> => {
  const distribuicao = createNFeDistribuicao(inputs.config)
  return distribuicao.consultaNSU({ NSU: inputs.NSU })
}

export const nfeEnviarEvento = async (
  inputs: EnviarEventoInput
): Promise<EventoResponse> => {
  const recepcaoEvento = createNFeRecepcaoEvento(inputs.config)
  return recepcaoEvento.enviarEvento({
    idLote: inputs.idLote,
    lote: inputs.lote,
  })
}

export { NFeDistribuicao } from "./controllers/nfe-distribuicao-controller"
export { NFeRecepcaoEvento } from "./controllers/nfe-recepcao-evento-controller"

// Exportar enums para facilitar o uso
export { UFCode, Ambiente, TipoEvento } from "./schema"
export type {
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
  DistribuicaoResponse,
  EventoResponse,
  EventoLote,
  DocZip,
  InfEvento,
} from "./schema"
