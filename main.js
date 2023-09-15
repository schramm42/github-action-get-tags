const { appendFile } = require('node:fs/promises');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const main = async () => {
    try {
        // const revList = await getRevList()
        // const tagList = await getTagList(revList)
        const tagList = await getTagList()
        //console.log(revList)
        console.log(tagList)
        const currentTag = tagList.shift()
        const previousTag = tagList.shift()

        const lines = [
            `currentTag=${currentTag}`,
            `previousTag=${previousTag}`
        ].join('\n')

        if (process.env.GITHUB_OUTPUT) {
            await appendFile(process.env.GITHUB_OUTPUT, `${lines}\n`)
        } else {
            console.log(lines)
        }
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

async function getTagList() {
    const { fetchStdout, fetchStderr } = await exec(`git fetch --tags -q && git tag -l`)
    console.log(fetchStdout)
    console.error(fetchStderr)
    const { stdout, stderr } = await exec(`git fetch --tags -q && git tag -l`)
    console.error(stderr)
    const list = stdout.split('\n').filter((val) => val != "").reverse()

    return list
}

async function getTagListByRevList(revList) {
    var result = []
    for (let item of revList) {
        try {
            const { stdout, stderr } = await exec(`git describe --abbrev=0 --tags ${item}`)
            result.push(stdout.trim())
        } catch (err) {
            if (!err.stderr.includes("No tags can describe")) {
                throw err
            }
        }
    }

    return result
}

async function getRevList() {
    const { stdout, stderr } = await exec(`git rev-list --tags`)
    const revList = stdout.split('\n').filter((val) => val != "")

    return revList
}

main()