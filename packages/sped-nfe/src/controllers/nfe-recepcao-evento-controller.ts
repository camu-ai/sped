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
   * **Tipos de eventos disponíveis:**
   * - 210200: Confirmação da Operação - confirma a ocorrência da operação e recebimento da mercadoria
   * - 210210: Ciência da Emissão - indica que o destinatário tem ciência da emissão da NFe
   * - 210220: Desconhecimento da Operação - quando o destinatário não reconhece a operação
   * - 210240: Operação não Realizada - quando a operação não foi efetivamente realizada (requer justificativa)
   *
   * **REGRAS CRÍTICAS DE USO:**
   * - **Máximo 20 eventos por lote**: Cada lote pode conter até 20 eventos
   * - **idLote único**: Identificador deve ser único (1-15 caracteres numéricos)
   * - **Manifestação única**: Cada NFe pode receber apenas uma manifestação por tipo
   * - **Prazo para manifestação**: Eventos devem ser enviados dentro do prazo legal
   * - **Justificativa obrigatória**: Evento 210240 requer campo justificativa preenchido
   * - **Certificado válido**: Deve usar certificado do próprio destinatário
   * - **Sequência de eventos**: nSeqEvento deve ser sequencial para cada chave de NFe
   *
   * **Códigos de Status:**
   * - 128: "Lote de evento processado" - lote aceito para processamento
   * - 135: "Evento registrado e vinculado a NFe" - evento processado com sucesso
   * - 573: "Duplicidade de evento" - evento já foi registrado anteriormente
   * - 656: "Rejeição: Falha na comunicação" - problemas de conectividade ou uso indevido
   *
   * **Validações automáticas:**
   * - Certificado digital deve corresponder ao CNPJ/CPF do destinatário
   * - NFe deve existir e estar autorizada
   * - Destinatário deve ter permissão para manifestar-se sobre a NFe
   * - Formato e conteúdo dos eventos são validados automaticamente
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
