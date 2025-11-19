import { Bible } from "./bible.types";
import { VersionEnum } from "../../database/enums/VersionEnum";

import nvi from "./data/nvi.json";
import acf from "./data/acf.json";
import aa from "./data/aa.json";

const bibleMap: Record<VersionEnum, Bible> = {
  [VersionEnum.NVI]: nvi as Bible,
  [VersionEnum.ACF]: acf as Bible,
  [VersionEnum.AA]: aa as Bible,
};

export class BibleRepository {
  static get(version: VersionEnum): Bible {
    const bible = bibleMap[version];
    if (!bible) throw new Error("Versão bíblica não suportada");
    return bible;
  }
}
