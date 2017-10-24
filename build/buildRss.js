const axios = require('axios');
const RSS = require('rss');
const fs = require('fs');
const ejs = require('ejs')

const token = "e52a12dd25f53394e394ee42cd1d5ed9a08d6aa9"//process.env.githubToken
const repoName = 'https://api.github.com/repos/MicrosoftDocs/azure-docs/' //commits?path=articles/azure-stack/'
const targetDirName = [
    'azure-stack',
    'availability-zones',
    'networking',
    'virtual-machines',
    'virtual-network',
    'vpn-gateway'
    ]

const getTargetDir = async ()=>{
    return targetDirName
}

const buildRss = async(targetDirName) =>{
    for(let dir of targetDirName){

        let feed = new RSS({
            title: 'azure-docs-update(' + dir +')',
            feed_url: 'http://i.anison.me/' + dir + '.xml',
            site_url: 'http://update-check.azurewebsites.net'
        });

        let results = await axios.get(repoName + 'commits?path=articles/' + dir + '/&access_token=' + token)        

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

/*
'use strict';

const RSS = require('rss');
const requestPromise = require('request-promise');
const fsPromise = require('fs-promise');

const main = async() => {

  const feed = new RSS({
    title: "Anison.me",
    feed_url: "https://i.anison.me/feed.xml",
    site_url: "https://i.anison.me"
  });
  
  let options = {
    uri: 'https://i.anison.me/anisonList.json',
    json: true
  };

  let resp = await requestPromise(options)
  
  resp.forEach(song => {
    let tmp = {}
    tmp.title = song.details.collectionName + " / " + song.details.artistName
    tmp.url = "https://i.anison.me/#" + song.details.collectionId
    tmp.guid = song.details.collectionId
    tmp.date = song.details.releaseDate
    tmp.enclosure = {}
    tmp.enclosure.url = song.details.artworkUrl100
    tmp.enclosure.size = 1234
    tmp.enclosure.type = 'image/jpeg'
    feed.item(tmp)
  })
  
  const xml = feed.xml({indent: true});
  await fsPromise.writeFile('public/feed.xml', xml)
}

main()
*/

