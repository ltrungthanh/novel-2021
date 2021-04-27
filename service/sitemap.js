const { createSitemapsAndIndex } = require('sitemap')
const Novels = require('../models/novelModel');
const Chapters = require('../models/chapterModel');
var path = require('path');
require('dotenv').config()


class SiteMapService {
    constructor() { }
    createSiteMap() {
        createSiteMap()
    }
}

let findChapters = function (novel_id) {

    return new Promise(function (reslove, reject) {
        Chapters.find({ "novel.novel_id": novel_id }, { chapter_id: 1, crawler_date: 1 }, function (err, chapters) {
            if (!err) {

                reslove(chapters)
            } else {
                reslove([])

            }
        }).lean()
    })
}

let createSiteMap = function () {
    Novels.find({}, async function (err, novels) {
        if (!err) {
            let urls = [];
            for (let _idx = 0; _idx < novels.length; _idx++) {

                const novel_info = novels[_idx];
                let itemUrl = { url: `/${process.env.URL_BASE_NOVEL}/${novel_info.novel_id}/`, priority: 0.9, lastmod: novel_info.crawler_date }
                urls.push(itemUrl);

                let chapters = await findChapters(novel_info.novel_id);

                for (let _idxChapter = 0; _idxChapter < chapters.length; _idxChapter++) {
                    const chapter_info = chapters[_idxChapter];
                    let itemUrlChapter = { url: `/${process.env.URL_BASE_NOVEL}/${novel_info.novel_id}/${chapter_info.chapter_id}`, priority: 0.7, lastmod: chapter_info.crawler_date }
                    urls.push(itemUrlChapter);
                }
            }

            createSitemapsAndIndex({
                urls: urls,
                targetFolder: path.join(__basedir, 'public'),
                hostname: process.env.DOMAIN,
                cacheTime: 600,
                sitemapName: 'sitemap',
                sitemapSize: 5000, // number of urls to allow in each sitemap
                gzip: false, // whether to gzip the files
            })
        }
    }).sort({ crawler_date: -1 }).limit(2500)

}

module.exports = SiteMapService;