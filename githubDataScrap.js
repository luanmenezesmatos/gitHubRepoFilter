const request = require('request');
const express = require('express');
const app = express();
const cheerio = require('cheerio');
const mysql = require('mysql');
const config = require('./mysql/config.js');
const connection = mysql.createConnection(config);

app.set('view engine', 'ejs');
app.set('views', './views')

var repos;

app.get('/scrape', (req, res) => {
  scrapDataForJs().then((reposList) => {
    return insertValue(reposList);
  }).then(() => {
    res.render()
  }).catch((err) => {
    console.log(err)
  })
});

function scrapDataForJs() {
  return new Promise((resolve, reject) => {
    const githubReposListUrl = 'https://github.com/trending/javascript';
    request(githubReposListUrl, function (err, res, html) {
      if (!err) {
        var rep = getListFromHtml(html);
        resolve(rep);
      } else {
        reject(err);
      }

    });

  })
}

function getTrendsForAllLanguages(){
  var timeLine =['daily','weekly','monthly'];
  var allTrendsPromiseList=[];
  var allTrendsList=[];
  var rep;
  return new Promise((resolve,reject)=>{
    for(var i=0;i<3;i++){
      var promise = new Promise((reso,rej)=>{
        var url = `https://github.com/trending?since=${timeLine[i]}`;

        request(url,(err,res,html)=>{
          if(!err){
            rep = getListFromHtml(html);
            allTrendsList.push(rep);
            reso(rep);
          } else{
            rej(err);
          }
        })
      });

      allTrendsPromiseList.push(promise);
    }

    Promise.all(allTrendsPromiseList).then((allTrendsList) => {
      resolve(allTrendsList);
    }).catch((err) => {
      reject(err);
    })
  })
}

function insertValue(reposList) {
  return new Promise((Resolve, Reject) => {
    var PromiseList = [];
    for (var i = 0; i < reposList.length; i++) {
      var sql = 'insert into repos(id,name) values (?,?)';
      const index = i + 1;
      const value = reposList[i];
      var values = [index, value];
      var promise = new Promise((resolve, reject) => {
        connection.query(sql, values, (err, res) => {
          if (err) reject(err);
          console.log(i, 'done');
          resolve();
        });
      })
      PromiseList.push(promise);
    }

    Promise.all(PromiseList).then((val) => {
      Resolve();
    }).catch((err) => {
      Reject(err);
    })
  });
}

function getStarredReposList(){
  return new Promise((resolve, reject) => {
    const githubReposListUrl = 'https://github.com/search?p=1&q=stars%3A%3E1&type=Repositories&utf8=%E2%9C%93';
    request(githubReposListUrl, function (err, res, html) {
      if (!err) {
        var rep = getListFromHtml(html);
        rep.shift();
        resolve(rep);
      } else {
        reject(err);
      }
    });

  })
}

app.get('/displayData', (req, res) => {
  var allLists =[];
  scrapDataForJs().then((repos)=>{
    allLists.push(repos);
    return getTrendsForAllLanguages();
  }).then((allTrendsList)=>{
    allLists.push(allTrendsList);
    console.log(allLists.length);
    return getStarredReposList();
  }).then((starredList)=>{
    allLists.push(starredList);
    res.render('displayData',{jsList:allLists[0],trendsList:allLists[1],starredList:allLists[2]});
  }).catch((err)=>{
    console.log(err);
  })
});

function getListFromHtml(html){
  let $ = cheerio.load(html);
  let repos = $("h3");
  let reposData = repos.text();
  var list = (reposData.split('\n'));
  var rep = [];
  for (var i in list) {
    list[i] = list[i].trim();
    if (list[i]) {
      rep.push(list[i]);
    }
  }

  return rep;
}

app.listen(4000, () => {
  console.log('listening at port 4000');
})

