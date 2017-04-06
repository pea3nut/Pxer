class PxerSaver extends PxerPrinter {
  constructor(ppConfig) {
    super({
        "manga_single": ppConfig.manga_single,
        "manga_multiple": ppConfig.manga_multiple,
        "illust_single": ppConfig.illust_single,
        "illust_multiple": ppConfig.illust_multiple,
        "ugoira_zip": "no",
        "ugoira_frames": "no",
    })
  }
  
}
