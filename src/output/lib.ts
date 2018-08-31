import { PxerWorks, PxerWorkUrl, PxerUgoiraWorksUrl } from "../pxer/pxerapp/PxerWorksDef.-1";

enum PxerIndeterminatableBoxState {
    all,
    none,
    indeterminate,
}

type PxerSelectableWorks = {checked: boolean} & PxerWorks;

interface IPxerOutputConfig {
    illust_single: keyof PxerWorkUrl
    illust_multiple: keyof PxerWorkUrl
    manga_single: keyof PxerWorkUrl
    manga_multiple: keyof PxerWorkUrl
    ugoira: keyof PxerUgoiraWorksUrl
}

export {PxerIndeterminatableBoxState, PxerSelectableWorks, IPxerOutputConfig}