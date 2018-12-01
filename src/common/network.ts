import { URL } from "url";

// @ts-ignore
const inBrowser: boolean =  typeof window !== "undefined"

/**
 * Networking encapsulation layer
 * @class
 */
export default class NetworkAgent {
    static get(url: string|URL) :Promise<[number, string]> {
        if (inBrowser) {
            return async function(url: string|URL) :Promise<[number, string]>{
                // @ts-ignore
                let req = await fetch(url, {credentials: "include"})
                return [req.status, await req.text()]
            }(url)
        } else {
            return new Promise<[number, string]>((resolve, reject)=>{
                const request = require("request");
                request({
                    method: "GET",
                    url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
                        'Cookie': process.env.cookie || process.env.COOKIE,
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Cache-Control': 'max-age=0',
                        'TE': 'Trailers',
                    },
                    gzip: true,
                }, function(error: Error|null, response: any, body: any){
                    if (error) {
                        reject(error)
                    } else {
                        resolve([response.statusCode, body.toString()])
                    }
                })
            })
        }
    }
}