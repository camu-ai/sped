export class SpedNFe {
  constructor(private configs: { nfe: { chNFe: string; tpNFe: string } }) {
    console.log(`NFe document capture: ${this.configs.nfe.chNFe}`)
    console.log(this.configs)
  }
}
