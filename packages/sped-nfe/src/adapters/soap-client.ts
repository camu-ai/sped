import https from "node:https"
import type { NFeDistribuicaoConfig, NFeRecepcaoEventoConfig } from "../schema"

interface SoapRequestParams {
  xml: string
  config: NFeDistribuicaoConfig | NFeRecepcaoEventoConfig
  endpoint: `NFeDistribuicaoDFe` | `NFeRecepcaoEvento`
}

interface SoapResponse {
  data: string
  status: number
}

export const sendSoapRequest = async (
  inputs: SoapRequestParams
): Promise<SoapResponse> => {
  const { xml, config, endpoint } = inputs

  const url = getEndpointUrl(endpoint, config.tpAmb)
  const httpsAgent = createHttpsAgent(config)

  try {
    const response = await fetch(url, {
      method: `POST`,
      headers: {
        "Content-Type": `application/soap+xml; charset=utf-8`,
        SOAPAction: ``,
      },
      body: xml,
      signal: AbortSignal.timeout(30000),
      // @ts-expect-error - agent is supported in Node.js fetch
      agent: httpsAgent,
    })

    const responseText = await response.text()

    return {
      data: responseText,
      status: response.status,
    }
  } catch (error) {
    throw new Error(
      `SOAP request error: ${error instanceof Error ? error.message : `Unknown error`}`
    )
  }
}

const createHttpsAgent = (
  config: NFeDistribuicaoConfig | NFeRecepcaoEventoConfig
): https.Agent => {
  const agentOptions: https.AgentOptions = {
    // Default HTTPS options
    rejectUnauthorized: true,
    timeout: 30000,
  }

  // Configure certificate authentication
  if (config.pfx && config.passphrase) {
    // Use PFX certificate
    agentOptions.pfx = config.pfx
    agentOptions.passphrase = config.passphrase
  } else if (config.cert && config.key) {
    // Use separate cert and key files
    agentOptions.cert = config.cert
    agentOptions.key = config.key
  } else {
    throw new Error(
      `Certificate configuration required: provide either PFX with passphrase or cert and key files`
    )
  }

  // Merge user-provided HTTPS options
  if (config.options?.httpsOptions) {
    Object.assign(agentOptions, config.options.httpsOptions)
  }

  return new https.Agent(agentOptions)
}

const getEndpointUrl = (endpoint: string, tpAmb: string): string => {
  const isProduction = tpAmb === `1`
  const baseUrl = isProduction
    ? `https://www1.nfe.fazenda.gov.br`
    : `https://hom.nfe.fazenda.gov.br`

  switch (endpoint) {
    case `NFeDistribuicaoDFe`:
      return `${baseUrl}/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx`
    case `NFeRecepcaoEvento`:
      return `${baseUrl}/NFeRecepcaoEvento/NFeRecepcaoEvento.asmx`
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`)
  }
}
