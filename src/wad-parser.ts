import { Wad } from '@perry-rylance/doom-wad';

export class WadParser {
  public async parse(file: File): Promise<Wad> {
    const arrayBuffer = await file.arrayBuffer();
    const wad = new Wad();
    await wad.load(new Uint8Array(arrayBuffer));
    return wad;
  }
}
