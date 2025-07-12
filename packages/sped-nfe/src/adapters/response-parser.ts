import type { DistribuicaoResponse, DocZip, EventoResponse } from "../schema"

interface ParseDistribuicaoParams {
  responseXml: string
  requestXml: string
  status: number
}

interface ParseEventoParams {
  responseXml: string
  requestXml: string
  status: number
}

export const parseDistribuicaoResponse = (
  inputs: ParseDistribuicaoParams
): DistribuicaoResponse => {
  const { responseXml, requestXml, status } = inputs

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(responseXml, `text/xml`)

    const retDistDFeInt = xmlDoc.querySelector(`retDistDFeInt`)
    if (!retDistDFeInt) {
      throw new Error(`Invalid XML response: retDistDFeInt element not found`)
    }

    const data = {
      tpAmb: getElementText(retDistDFeInt, `tpAmb`),
      verAplic: getElementText(retDistDFeInt, `verAplic`),
      cStat: getElementText(retDistDFeInt, `cStat`),
      xMotivo: getElementText(retDistDFeInt, `xMotivo`),
      dhResp: getElementText(retDistDFeInt, `dhResp`),
      ultNSU: getElementText(retDistDFeInt, `ultNSU`),
      maxNSU: getElementText(retDistDFeInt, `maxNSU`),
    }

    const loteDistDFeInt = retDistDFeInt.querySelector(`loteDistDFeInt`)
    let docZip: Array<DocZip> | undefined

    if (loteDistDFeInt) {
      const docZipElements = loteDistDFeInt.querySelectorAll(`docZip`)
      docZip = Array.from(docZipElements).map((element) => {
        const nsu = element.getAttribute(`NSU`) || ``
        const schema = element.getAttribute(`schema`) || ``
        const base64Content = element.textContent || ``

        try {
          const decompressedXml = decompressGzip(base64Content)
          const json = parseXmlToJson(decompressedXml)

          return {
            xml: decompressedXml,
            json,
            nsu,
            schema,
          }
        } catch {
          return {
            xml: base64Content,
            json: {},
            nsu,
            schema,
          }
        }
      })
    }

    return {
      data: { ...data, docZip },
      reqXml: requestXml,
      resXml: responseXml,
      status,
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `Error processing response`,
      reqXml: requestXml,
      resXml: responseXml,
      status,
    }
  }
}

export const parseEventoResponse = (
  inputs: ParseEventoParams
): EventoResponse => {
  const { responseXml, requestXml, status } = inputs

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(responseXml, `text/xml`)

    const retEnvEvento = xmlDoc.querySelector(`retEnvEvento`)
    if (!retEnvEvento) {
      throw new Error(`Invalid XML response: retEnvEvento element not found`)
    }

    const data = {
      idLote: getElementText(retEnvEvento, `idLote`),
      tpAmb: getElementText(retEnvEvento, `tpAmb`),
      verAplic: getElementText(retEnvEvento, `verAplic`),
      cOrgao: getElementText(retEnvEvento, `cOrgao`),
      cStat: getElementText(retEnvEvento, `cStat`),
      xMotivo: getElementText(retEnvEvento, `xMotivo`),
    }

    const retEventos = retEnvEvento.querySelectorAll(`retEvento`)
    const infEvento = Array.from(retEventos).map((retEvento) => ({
      tpAmb: getElementText(retEvento, `tpAmb`),
      verAplic: getElementText(retEvento, `verAplic`),
      cOrgao: getElementText(retEvento, `cOrgao`),
      cStat: getElementText(retEvento, `cStat`),
      xMotivo: getElementText(retEvento, `xMotivo`),
      chNFe: getElementText(retEvento, `chNFe`),
      tpEvento: getElementText(retEvento, `tpEvento`),
      xEvento: getElementText(retEvento, `xEvento`),
      nSeqEvento: getElementText(retEvento, `nSeqEvento`),
      CNPJDest: getElementText(retEvento, `CNPJDest`),
      dhRegEvento: getElementText(retEvento, `dhRegEvento`),
      nProt: getElementText(retEvento, `nProt`),
    }))

    return {
      data: { ...data, infEvento },
      reqXml: requestXml,
      resXml: responseXml,
      status,
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `Error processing response`,
      reqXml: requestXml,
      resXml: responseXml,
      status,
    }
  }
}

const getElementText = (parent: Element, tagName: string): string => {
  const element = parent.querySelector(tagName)
  return element?.textContent || ``
}

const decompressGzip = (base64Content: string): string => {
  try {
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const decompressed = new TextDecoder().decode(bytes)
    return decompressed
  } catch {
    return base64Content
  }
}

const parseXmlToJson = (xml: string): any => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, `text/xml`)
    return xmlToObject(xmlDoc.documentElement)
  } catch {
    return {}
  }
}

const xmlToObject = (element: Element): any => {
  const obj: any = {}

  if (element.attributes.length > 0) {
    for (const attr of element.attributes) {
      obj[`@${attr.name}`] = attr.value
    }
  }

  if (element.childNodes.length > 0) {
    for (const child of element.childNodes) {
      if (child.nodeType === 1) {
        const childElement = child as Element
        const childName = childElement.tagName

        if (obj[childName]) {
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]]
          }
          obj[childName].push(xmlToObject(childElement))
        } else {
          obj[childName] = xmlToObject(childElement)
        }
      } else if (child.nodeType === 3 && child.nodeValue?.trim()) {
        return child.nodeValue.trim()
      }
    }
  }

  return obj
}
