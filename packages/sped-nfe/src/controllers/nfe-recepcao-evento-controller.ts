import { validateRecepcaoEventoConfig } from "../logic/validation"
import { buildEventoRequest } from "../logic/soap-builder"
import { sendSoapRequest } from "../adapters/soap-client"
import { parseEventoResponse } from "../adapters/response-parser"
import type {
  EventoLote,
  EventoResponse,
  NFeRecepcaoEventoConfig,
} from "../schema"

export class NFeRecepcaoEvento {
  private readonly config: NFeRecepcaoEventoConfig

  constructor(config: NFeRecepcaoEventoConfig) {
    validateRecepcaoEventoConfig(config)
    this.config = Object.freeze({ ...config })
  }

  /**
   * Envia eventos de manifestação do destinatário para NFe.
   *
   * Permite ao destinatário manifestar-se sobre NFe emitidas para seu CNPJ/CPF,
   * confirmando ou rejeitando operações. A manifestação é obrigatória para
   * operações onde o destinatário é parte interessada.
   *
   * Tipos de eventos disponíveis:
   * - 210200: Confirmação da Operação - confirma a ocorrência da operação e recebimento da mercadoria
   * - 210210: Ciência da Emissão - indica que o destinatário tem ciência da emissão da NFe
   * - 210220: Desconhecimento da Operação - quando o destinatário não reconhece a operação
   * - 210240: Operação não Realizada - quando a operação não foi efetivamente realizada (requer justificativa)
   *
   * Retorna cStat 128 quando o lote é processado com sucesso e cStat 135
   * quando o evento é registrado e vinculado à NFe.
   *
   * @param inputs - Parâmetros do envio
   * @param inputs.idLote - Identificador único do lote (1-15 caracteres numéricos)
   * @param inputs.lote - Array de eventos para manifestação, máximo 20 eventos por lote
   * @returns Promise com a resposta do processamento dos eventos
   */
  async enviarEvento(inputs: {
    idLote: string
    lote: Array<EventoLote>
  }): Promise<EventoResponse> {
    try {
      const requestXml = buildEventoRequest({
        config: this.config,
        idLote: inputs.idLote,
        lote: inputs.lote,
      })

      const response = await sendSoapRequest({
        xml: requestXml,
        config: this.config,
        endpoint: `NFeRecepcaoEvento`,
      })

      return parseEventoResponse({
        responseXml: response.data,
        requestXml,
        status: response.status,
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : `Unknown error`,
        status: 500,
      }
    }
  }
}

export const createNFeRecepcaoEvento = (
  config: NFeRecepcaoEventoConfig
): NFeRecepcaoEvento => {
  return new NFeRecepcaoEvento(config)
}
