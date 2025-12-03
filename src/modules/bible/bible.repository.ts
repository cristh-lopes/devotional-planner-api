import { Bible } from "./bible.types";
import { VersionEnum } from "./bible.enum";

import nvt from "./data/nvt.json";
import ntlh from "./data/ntlh.json";
import nbv from "./data/nbv.json";
import naa from "./data/naa.json";
import nvi from "./data/nvi.json";
import acf from "./data/acf.json";
import aa from "./data/aa.json";

const bibleMap: Record<VersionEnum, Bible> = {
  [VersionEnum.NVI]: nvi as Bible,
  [VersionEnum.NTLH]: ntlh as Bible,
  [VersionEnum.NBV]: nbv as Bible,
  [VersionEnum.NVT]: nvt as Bible,
  [VersionEnum.NAA]: naa as Bible,
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
