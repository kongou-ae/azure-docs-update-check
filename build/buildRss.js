const axios = require('axios');
const RSS = require('rss');
const fs = require('fs');
const ejs = require('ejs')

const token = process.env.githubToken
const repoName = 'https://api.github.com/repos/MicrosoftDocs/azure-docs/'

axios.defaults.headers.common["User-Agent"] = "nodejs"
axios.defaults.headers.common["Authorization"] = "token " + token


function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

const getTargetDir = async ()=>{
    
    console.log('Check the target dir')
    try {
        let results = await axios.get(repoName + 'contents/articles/')
        let targetDirName = []
        for(let data of results.data){
            if (data.type == 'dir'){
                targetDirName.push(data.name)
                console.log('added ' + data.name)
            }
        }
        return targetDirName
    } catch (err) {
        console.log(err.data)
    }
}

const buildRss = async(targetDirName) =>{
    for(let dir of targetDirName){

        let feed = new RSS({
            title: 'azure-docs-update(' + dir +')',
            feed_url: 'http://update-check.azurewebsites.net/' + dir + '.xml',
            site_url: 'http://update-check.azurewebsites.net'
            
        });
        try {
            let results = await axios.get(repoName + 'commits?path=articles/' + dir)        
            for (let result of results.data) {
                let tmp = {}
                tmp.title = result.commit.message
                tmp.url = result.html_url
                tmp.guid = result.commit.tree.sha
                tmp.date = result.commit.author.date
                feed.item(tmp)
            }
            const xml = feed.xml({indent: true});
            await fs.writeFileSync('dist/' + dir + '.xml', xml,{'encoding':'utf8','flag':'w'})
            console.log('added ' + 'dist/' + dir + '.xml')
        } catch (err) {
            console.log(err.data)
        }
    }
}

const buildIndex = async(dir) => {

    ejs.renderFile('build/index.ejs', {dir:dir}, function(err, str){
        fs.writeFileSync('dist/index.html', str,{'encoding':'utf8','flag':'w'})
    });

}

const main = async() =>{
    let dir = await getTargetDir()
    await buildRss(dir)
    await buildIndex(dir)
}

main()