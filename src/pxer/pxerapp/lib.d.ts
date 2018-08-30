interface PxerUrlData {
    protocol: string,
    domain: string,
    path: string,
    query: string|PxerUrlQueryMap
}
interface PxerUrlQueryMap {[key: string]:string}
interface Window {
    PXER_URL: string,
    PXER_MODE: string,
    PXER_ERROR: string,
    PXER_VERION: string,
}
