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
