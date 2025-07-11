export class SpedNFe {
  constructor(private configs: { nfe: { chNFe: string; tpNFe: string } }) {
    console.log(`NFe document capture: ${this.configs.nfe.chNFe}`)
    console.log(`NFe document capture: ${this.configs.nfe.tpNFe}`)
  }

  capture(): string {
    console.log(`NFe document capture: ${this.configs.nfe.chNFe}`)
    return this.configs.nfe.chNFe
  }
}
