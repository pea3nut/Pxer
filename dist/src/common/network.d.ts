/// <reference types="node" />
import { URL } from "url";
export default class NetworkAgent {
    static get(url: string | URL): Promise<string>;
}
