const fs = require('fs');
var inquirer = require('inquirer');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

let getAllVideos = url => {
    return new Promise((resolve, reject) => {
        ytpl(url,(err, playlist) => {
            try{
                if(err) throw err;
                resolve(playlist)
            }
            catch(error){
                console.log("Error",error)
                reject(error)
            }
        }); 
    });  
}

let downloadVideo = videoUrl => {
    return new Promise((resolve, reject) => {
        let videoId = ytdl.getURLVideoID(videoUrl)
        ytdl.getInfo(videoId, (err, info) => {
            try{
                if (err) throw err;
                let title = info.player_response.videoDetails.title
                let writeStream = fs.createWriteStream(`./videos/${title}.mp4`)
            
                let download = ytdl(videoUrl)
                download.pipe(writeStream);
            
                // download.on('progress',(chunkLength, downloaded, total) => {
                //     let percent = Math.floor((downloaded / total) * 100);
                //     console.log("Progress:",percent);
                // });
            
                download.on('end', function (end) {
                    console.log(`finished downloading ${title}`)
                    resolve(title)
                });
            }
            catch(error){
                reject(error)
            }
        });
    })
}

inquirer
  .prompt([
    {
      type: 'list',
      name: 'urlType',
      message: 'Want to download a full playlist or a single video ?',
      choices: [
        'Video',
        'Playlist',
        new inquirer.Separator(),
        'Created by Ananthu',
        {
          name: 'Not for commercial use',
          disabled: ''
        },
        'Only for personal use'
      ]
    },
    {
      type: 'input',
      name: 'url',
      message: 'Please enter the url',
      filter: function(val) {
        return val.trim();
      }
    }
  ])
  .then(async answers => {
    try {
        if(answers.urlType == 'Video'){
            downloadVideo(answers.url)
        }else if(answers.urlType == 'Playlist'){
            let promises = []
            let videoUrls = await getAllVideos(answers.url)
            videoUrls.items.forEach(link => {
                let singleVideoDownload = downloadVideo(link.url_simple)
                promises.push(singleVideoDownload)
            })
            await Promise.all(promises)
            console.log("All videos in the playlist downloaded")
        }
    }
    catch(error){
        console.log("Error",error)
    }

  });










 
