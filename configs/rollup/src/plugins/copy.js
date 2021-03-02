import path from 'path'
import copy from "rollup-plugin-copy";
export default ({ baseDir }) => 
    copy({
        targets: [
            // {
            //     src: path.join(__dirname, "../../../public/*"),
            //     dest: baseDir,
            // },
            {
                src: path.join(process.cwd(), "./public/*"),
                dest: baseDir,
            },
        ],
    })