import { ErrType } from "./common/error"

export type illustType = "illust" | "manga" | "ugoira"

export type Task = {
    Directive: string,
    Payload: TaskPayloadBase,
}

export interface TaskPayloadBase {}

export type WorkResult = {
    illustID: string,
    illustType: illustType,
    URLs: {
        mini: string,
        thumb: string,
        small: string,
        regular: string,
        original: string,
    }
    UgoiraMeta?: UgoiraMeta,
}

export type UgoiraMeta = {
    src: string,
    originalSrc: string,
    mime_type: string,
    frames: {
        file: string,
        delay: number,
    }[]
}

export type ErrInfo = {
    fatal: boolean,
    type: ErrType,
    extraMsg: string,
    rawErr: Error|null,
}

export type testFunc = (n: number)=>Promise<void>

export type ResolverFunction = (
    task: Task,
    gotWork: (work: WorkResult)=>void,
    addTask: (task: Task)=>void,
    reportErr: (err: ErrInfo)=>void,
) => Promise<void>
