import React from 'react'
import {IPxerUgoiraFrameData, PxerUgoiraWorksUrl, PxerUgoiraWorks} from '../../pxer/pxerapp/PxerWorksDef.-1'
import PxerTextModal from './PxerTextModal';
import { PxerSelectableWorks } from '../lib';
import { PxerWorkType } from '../../pxer/pxerapp/PxerData.-1';

class PxerScriptor {
    static isWindows() {
        return ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(navigator.platform)!==-1
    }
    static generateUgoiraScript(frames :{[id :string]:IPxerUgoiraFrameData}, outputType: keyof PxerUgoiraWorksUrl){
        var lines=[];
        var resstring;
        var ffmpeg;
        var isWindows = this.isWindows();
        switch (outputType) {
            case "ugoira_600p": resstring = "1920x1080"; break;
            case "ugoira_master": resstring = "600x338"; break;
        }
        var slashstr = "";
        if (isWindows) {
            slashstr="^";
            ffmpeg="ffmpeg";
            lines.push("@echo off");
            lines.push("set /p ext=请输入输出文件扩展名(mp4/gif/...):");
        } else {
            slashstr="\\";
            ffmpeg="$ffmpeg";
            lines.push("#!/bin/bash");
            lines.push("");
            lines.push("{ hash ffmpeg 2>/dev/null && ffmpeg=ffmpeg;} || { [ -x ./ffmpeg ] && ffmpeg=./ffmpeg;} || { echo >&2 \"Failed to locate ffmpeg executable. Aborting.\"; exit 1;}");
            lines.push("read -p '请输入输出文件扩展名(mp4/gif/...):' ext");
        }
        for (let key in frames) {
            var foldername = key + "_ugoira" + resstring;
            var confpath = foldername + "/config.txt";
            var height = frames[key].height;
            var width = frames[key].width;
            if (outputType==="ugoira_600p") {
                var scale = Math.max(height, width)/600;
                height = Math.ceil(height/scale);
                width = Math.ceil(width/scale);
            }
            lines.push(isWindows?("del "+ foldername + "\\config.txt >nul 2>nul"):("rm "+ foldername + "/config.txt &> /dev/null"));
            for (let frame of frames[key].framedef) {
                lines.push("echo file "+slashstr+"'" + frame['file']+ slashstr +"' >> "+confpath);
                lines.push("echo duration " + frame.delay/1000 + " >> "+ confpath);
            }
            lines.push("echo file "+ slashstr + "'" +frames[key].framedef[frames[key].framedef.length-1]['file'] + slashstr + "' >> "+confpath);
            lines.push(isWindows? "if %ext%==gif (":"if [ $ext == \"gif\"]; then");
            lines.push(ffmpeg+" -f concat -i "+confpath+" -vf palettegen "+foldername+"/palette.png");
            lines.push(ffmpeg+" -f concat -i "+confpath+" -i "+foldername+"/palette.png -lavfi paletteuse -framerate 30 -vsync -1 -s "+width+"x"+height+" "+foldername+"/remux." + (isWindows? "%ext%":"$ext"));
            lines.push(isWindows? ") else (":"else");
            lines.push(ffmpeg+" -f concat -i "+confpath+" -framerate 30 -vsync -1 -s "+width+"x"+height+" "+foldername+"/remux." + (isWindows? "%ext%":"$ext"));
            lines.push(isWindows? ")":"fi");
        }
        if (isWindows) {
            lines.push("echo 完成 & pause");
        } else {
            lines.push("read  -n 1 -p \"完成，按任意键退出\" m && echo");
        }
        return lines;
    };
};

function PxerUgoiraScriptModal(props: {
    works: PxerSelectableWorks[],
    urlType: keyof PxerUgoiraWorksUrl,
    onClose: ()=>void,
    opened: boolean,
}){
    var ugoiraFrames: {[id :string]:IPxerUgoiraFrameData} = {};
    for (var work of props.works) {
        if (work.checked && work.type==PxerWorkType.Ugoira){
            ugoiraFrames[work.id] = (work as {checked: boolean} & PxerUgoiraWorks).frames
        }
    }
    return (
        <PxerTextModal
            headElem={
                <p>这个页面是自动生成的使用FFmpeg自行合成动图的{PxerScriptor.isWindows()?"批处理":"bash"}脚本，详细使用教程见<a href="http://pxer.pea3nut.org/md/ugoira_concat" target="_blank" >http://pxer.pea3nut.org/md/ugoira_concat</a></p>
            }
            text={
                Object.keys(ugoiraFrames).length===0?"未选择任何动图":
                PxerScriptor.generateUgoiraScript(ugoiraFrames, props.urlType).join("\n")
            }
            opened={props.opened}
            onClose={props.onClose}
        />
    )
}

export default PxerUgoiraScriptModal