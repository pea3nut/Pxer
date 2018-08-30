import PxerThreadManager from "./PxerThreadManager.2.class";
import { PxerRequest, PxerWorksRequest, PxerPageRequest } from "./PxerData.-1";
import { PxerHtmlParser } from "./PxerHtmlParser.class";
import { worker } from "cluster";
import { PxerWorks } from "./PxerWorksDef.-1";

class PxerMiddleWareFactory {
    static illustIDLargerthanWithStop(minID: number) :PxerThreadManager.IPTMFinishMiddleWare {
        return (ptm: PxerThreadManager, res: PxerRequest)=>{
            if (res instanceof PxerPageRequest) {
                var parseresult = PxerHtmlParser.parsePage(res)
                if (parseresult) {
                    for (var work of (<PxerWorksRequest[]>parseresult)) {
                        if (parseInt(work.id)<minID) {
                            ptm.stop();
                        }
                    }
                }
            }
            return true
        }
    }
    static illustIDLargerthan(minID: number) :PxerThreadManager.IPTMBeforeMiddleWare {
        return (req :PxerRequest)=>{
            if (req instanceof PxerWorksRequest) {
                return parseInt(req.id)>=minID
            }
            return true;
        }
    }
    static illustDateNewerThanWithStop(start: Date) :PxerThreadManager.IPTMFinishMiddleWare {
        return (ptm: PxerThreadManager, res: PxerRequest)=>{
            if (res instanceof PxerPageRequest) {
                var parseresult = PxerHtmlParser.parsePage(res)
                if (parseresult) {
                    for (var work of (<PxerWorksRequest[]>parseresult)) {
                        PxerHtmlParser.parseMediumHtml(PxerHtmlParser.HTMLParser(work.html[work.url[0]]), work).then(work=>{
                            if ((work instanceof PxerWorks) && work.date<start) {
                                ptm.stop();
                            }
                        })
                    }
                }
            }
            return true
        }
    }
}
export default PxerMiddleWareFactory