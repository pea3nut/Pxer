/**
 * 继承自printer，我要研究一下Pxer的event控制然后继续写
 */
class PxerSaver extends PxerPrinter {
  constructor(ppConfig) {
    //只能下载图片
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
