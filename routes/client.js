let express = require('express');
let router = express.Router();
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var moment = require('moment'); // require
var path = require('path');
const Settings = require('../models/settingModel');

const Reports = require('../models/reportModel');
const Chapter = require('../models/chapterModel');
const Novels = require('../models/novelModel');
const Contact = require('../models/contactModel');
const Users = require('../models/userModel');
const Clients = require('../models/clientModel');

var MobileDetect = require('mobile-detect');

require('dotenv').config();
const util = require('../helper/Helper');





const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

const EmailService = require('../service/email_service');
const emailHelper = new EmailService();

const rateLimit = require("express-rate-limit");
const Novel = require('../models/novelModel');

router.use(async function (req, res, next) {
    const domainName = req.get('host');
    req.getUrl = function () {
        return req.protocol + "://" + req.get('host') + req.originalUrl;
    }
    if (!cache.get("config")) {
        let config = await getConfig(domainName);
        cache.set('config', config);
    }
    next();
});
let getConfig = function (domainName) {
    return new Promise(function (reslove, reject) {
        Clients.findOne({ host: domainName }, function (err, client) {
            if (!err && client) {
                reslove(client.settings);
            } else {
                reslove({})
            }
        });
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function (chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});

router.get('/', function (req, res) {
    let getTrendings = cache.get('trending') ? cache.get('trending') : getTrendingNovel();
    let getTopCompleted = cache.get('completed') ? cache.get('completed') : getTopCompletedNovel();
    let getLastest = getLastestNovel();
    Promise.all([getTopCompleted, getTrendings, getLastest]).then(values => {
        trending = values[1];
        completed = values[0];
        novels = values[2];
        cache.set('trending', trending);
        cache.set('completed', completed);
        let config = cache.get("config");
        res.render('client/index', {
            layout: 'layout.hbs',
            novels: novels,
            trending: trending,
            config: config,
            completed: completed
        });
    }, reason => {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config
        });
    });
});
let getTrendingNovel = function () {
    return new Promise(function (reslove, reject) {
        Novel.find({}, { novel_name: 1, novel_id: 1, novel_status: 1 }, function (err, novels) {
            if (!err) {
                cache.set('trending', novels);
                reslove(novels)
            } else {
                reslove([])
            }
        }).limit(13).sort({ view: -1 }).lean()
    })
}

let getLastestNovel = function () {
    return new Promise(function (reslove, reject) {
        Novel.find({}, { new: 1, hot: 1, novel_name: 1, novel_id: 1, recentChapter: 1, crawler_date: 1, novel_genres: 1 }, function (err, novels) {
            if (!err) {
                reslove(novels)
            } else {
                reslove([])
            }
        }).limit(24).sort({ crawler_date: -1 }).lean();
    });
}

let getTopCompletedNovel = function () {
    return new Promise(function (reslove, reject) {
        Novel.find({ novel_status: 1 }, { novel_name: 1, novel_id: 1, totalChapter: 1 }, function (err, novels) {
            if (!err) {
                cache.set('completed', novels);
                reslove(novels)
            } else {
                reslove([])
            }
        }).limit(12).sort({ crawler_date: -1, novel_name: -1 }).lean();
    })
}

router.get(`/${process.env.URL_GENRE_NOVEL}/:genre/:status?`, function (req, res) {
    const genreName = req.params.genre;
    let genreId = req.params.genre.toUpperCase().replace('-', " ").replace('+', ' ').replace('+', ' ');
    if (genreId == 'SCI FI') {
        genreId = 'SCI-FI'
    }
    if (genreId == 'AI') {
        genreId = 'SHOUNEN AI'
    }
    const status = req.params.status || null;
    const page = Number(req.query.page) || 1;
    let config = cache.get("config");
    config['title_home'] = `${capitalizeFirstLetter(genreName)} Novel Online 2021 - ${util.getDomainDesc()} - Read Online Novel For Free !`;
    config['web_desc'] = `${capitalizeFirstLetter(genreName)} Novel Online 2021 - ${util.getDomainDesc()} - Read Online Novel For Free !`;
    config['keywords'] = `Read ${capitalizeFirstLetter(genreName)} Novel Online for Free in English`
    if (Number.isInteger(page) && page >= 1 && page <= 1000) {
        let novels_hot = [];
        if (cache.get('hot_novels')) {
            novels_hot = cache.get('hot_novels');
        } else {
            Novels.find({ hot: true }, { novel_name: 1, novel_id: 1, novel_genres: 1 }, function (err, results) {
                if (!err) {
                    novels_hot = results;
                    cache.set('hot_novels', results);
                }
            }).limit(10).sort({ crawler_date: 1 }).lean();
        }

        const skip = (page - 1) * 20;
        let query = {};
        if (genreId !== 'ALL') {
            query = { novel_genres: genreId };
        }
        let sort = { crawler_date: -1 };
        if (status == 'completed') {
            query['novel_status'] = 1;
        }
        let totalCount = 1;
        Novel.count(query, function (err, count) {
            if (!err) {
                totalCount = count
            }
        });
        Novel.find(query, function (err, novels) {
            if (!err) {
                var md = new MobileDetect(req.headers['user-agent']);
                let isMobile = md.mobile() ? true : false;
                res.render('client/pages/novel-genres', {
                    layout: 'layout.hbs',
                    config: config,
                    novels: novels,
                    status: status,
                    isMobile: isMobile,
                    genreId: genreId,
                    novels_hot: novels_hot,
                    genreName: genreName,
                    pagination: {
                        page: page,
                        pageCount: Math.ceil(totalCount / 20)
                    }
                });
            }

        }).sort(sort).limit(20).skip(skip).lean();
    } else {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config
        });
    }

});



router.get(`/${process.env.URL_BASE_NOVEL}/:novel_id`, csrfProtection, function (req, res) {
    let config = cache.get("config");
    const novel_id = req.params.novel_id.trim();

    let getNovel = cache.get(novel_id) ? cache.get(novel_id) : findOneNovel(novel_id);
    let get30Chapters = cache.get(`30_${novel_id}`) ? cache.get(`30_${novel_id}`) : find30FirstChapter(novel_id);

    Promise.all([getNovel, get30Chapters]).then(values => {
        let novel_info = values[0];
        let chapters_chunk = values[1];
        cache.set(novel_id, novel_info);
        cache.set(`30_${novel_id}`, chapters_chunk);
        if (novel_info) {
            const firstGenre = novel_info.novel_genres[0];
            config['title_home'] = `${novel_info.novel_name} Novel - Read ${novel_info.novel_name} Online For Free - ${util.getDomainDesc()}`;
            config['web_desc'] = util.getShortDescription(novel_info.novel_desc) + '...';
            config['keywords'] = `${novel_info.novel_name} novel 2021, read ${novel_info.novel_name} online 2021, ${novel_info.novel_name} online, free ${novel_info.novel_name} novel`;
            config['share_image'] = util.getNovelAvatar(novel_info.novel_id);
            Novel.find({ novel_genres: firstGenre }, { novel_id: 1, novel_name: 1, novel_genres: 1 }, function (err, novels_by_genres) {
                novels_by_genres = err ? [] : novels_by_genres;
                res.render('client/pages/novel', {
                    layout: 'layout.hbs',
                    config: config,
                    novels_by_genres: novels_by_genres,
                    csrfToken: req.csrfToken(),
                    firstGenre: firstGenre,
                    novel_info: novel_info,
                    chapters_chunk: chapters_chunk
                });
            }).sort({ view: -1 }).limit(10).lean();


        } else {
            res.render('client/pages/404', {
                layout: 'layout.hbs',
                config: config
            });
        }
    }, reason => {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config
        });
    })
});

let find30FirstChapter = function (novel_id) {
    return new Promise(function (reslove, reject) {
        Chapter.find({ "novel.novel_id": novel_id }, { chapter_name: 1, chapter_id: 1 }, function (err, chapters) {
            if (!err) {
                let chapters_chunk = chapters.chunk_inefficient(15);
                for (let index = 0; index < chapters_chunk.length; index++) {
                    chapters_chunk[index] = chapters_chunk[index].chunk_inefficient(5);
                }
                reslove(chapters_chunk);
            } else {
                reslove([]);
            }
        }).limit(30).sort({ crawler_date: 1 }).lean();
    })
}

let findOneNovel = function (novel_id) {
    return new Promise(function (reslove, reject) {
        Novel.findOne({ novel_id: novel_id }, function (err, novel_info) {
            if (!err && novel_info) {
                reslove(novel_info)
            } else {
                reslove(null)
            }
        }).lean();;
    });
}

let findOneChapter = function (novel_id, chapter_id) {
    return new Promise(function (reslove, reject) {
        Chapter.findOne({ "novel.novel_id": novel_id, chapter_id: chapter_id }, function (err, chapterInfo) {
            if (!err && chapterInfo) {
                reslove(chapterInfo)
            } else {
                reslove(null)
            }
        }).lean();
    });
}



router.get(`/${process.env.URL_PRIVACY_POLICY}`, function (req, res) {
    let config = cache.get("config");
    res.render('client/pages/policy', {
        layout: 'layout.hbs',
        config: config,

    });
});

router.get(`/${process.env.URL_CONTACT}`, csrfProtection, function (req, res) {
    let config = cache.get("config");
    config['title_home'] = `Contact - ${util.getDomainDesc()}`;
    res.render('client/pages/contact', {
        layout: 'layout.hbs',
        config: config,
        csrfToken: req.csrfToken(),
    });
});
router.post('/ajax/send-mail', csrfProtection, function (req, res) {
    if (req.body.name && req.body.email && req.body.subject && req.body.message) {
        Contact.create(req.body, function (err, data) {
            if (!err) {
                return res.json(true)
            } else {
                console.log(err)
            }
        })
    } else {
        return res.json(false)
    }
});


let findNextChapter = function (novel_id, objectId) {
    return new Promise(function (reslove, reject) {
        Chapter.findOne({ "novel.novel_id": novel_id, "_id": { $gt: objectId } }, { chapter_id: 1, chapter_name: 1 }, function (err, chapter) {
            if (!err && chapter) {
                reslove(chapter);
            } else {
                reslove(null);
            }
        }).sort({ crawler_date: 1 }).lean();
    });
}

let findPrevChapter = function (novel_id, objectId) {
    return new Promise(function (reslove, reject) {
        Chapter.findOne({ "novel.novel_id": novel_id, "_id": { $lt: objectId } }, { chapter_id: 1, chapter_name: 1 }, function (err, chapter) {
            if (!err && chapter) {
                reslove(chapter);
            } else {
                reslove(null);
            }
        }).sort({ crawler_date: -1 }).lean();
    });
}

router.get(`/${process.env.URL_BASE_NOVEL}/:novel_id/:chapter_id`, csrfProtection, function (req, res) {
    let config = cache.get("config");
    const novel_id = req.params.novel_id.trim();
    const chapter_id = req.params.chapter_id.trim();

    var findChapter = findOneChapter(novel_id, chapter_id);

    Novel.updateOne({ "novel_id": novel_id }, { $inc: { "view": 1 } }, function (err, data) {

    });
    Promise.all([findChapter]).then(values => {
        let chapterInfo = values[0];
        if (chapterInfo) {
            let getPrevChapter = findPrevChapter(novel_id, chapterInfo._id);
            let getNextChapter = findNextChapter(novel_id, chapterInfo._id);
            Promise.all([getPrevChapter, getNextChapter]).then(chapters => {
                let nextChapter = chapters[1];
                let prevChapter = chapters[0];
                config['web_desc'] = `Read ${chapterInfo.novel.novel_name} Chapter ${chapterInfo.chapter_name} Online 2021. ${chapterInfo.novel.novel_name} #Chapter ${chapterInfo.chapter_name} in one page for Free`;
                config['title_home'] = `${chapterInfo.novel.novel_name} #Chapter ${chapterInfo.chapter_name} - Read ${chapterInfo.novel.novel_name} Chapter ${chapterInfo.chapter_name} Online - All Page - ReadFullNovel`;
                config['keywords'] = `read ${chapterInfo.novel.novel_name} issue Chapter ${chapterInfo.chapter_name} online, free ${chapterInfo.novel.novel_name} Chapter ${chapterInfo.chapter_name}, read ${chapterInfo.novel.novel_name}  Novel online`;
                res.render('client/pages/chapter', {
                    layout: 'layout.hbs',
                    chapterInfo: chapterInfo,
                    prevChapter: prevChapter,
                    nextChapter: nextChapter,
                    csrfToken: req.csrfToken(),
                    config: config,

                });
            }, reason => {
                res.render('client/pages/404', {
                    layout: 'layout.hbs',
                    config: config,
                });
            });
        } else {
            res.render('client/pages/404', {
                layout: 'layout.hbs',
                config: config,
            });
        }

    }, reason => {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config,
        });
    });

});

router.post('/novel/ajax/report', csrfProtection, function (req, res) {
    Reports.create(req.body, function (err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: "Report Done"
            })
        } else {
            res.json({
                success: false,
                msg: "Report already exist"
            })
        }
    })
});

router.get('/ajax/search-novel', function (req, res) {
    Novels.find({ novel_name: { $regex: new RegExp(req.query.keyword.trim().toLowerCase(), "i") } }, { novel_name: 1, novel_id: 1 }, function (err, results) {
        if (!err) {
            res.render('client/pages/search/search-novel', {
                layout: 'search.hbs',
                results: results,
                keyword: req.query.keyword.trim()
            });
        }
    }).lean().sort({ crawler_date: -1, novel_name: -1 }).limit(10)

})

router.get('/search', function (req, res) {
    let config = cache.get("config");
    let keyword = req.query.keyword;

    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 20;
    let query = { novel_name: { $regex: new RegExp(req.query.keyword.trim().toLowerCase(), "i") } };
    let title = '';
    let sort = { crawler_date: -1 }

    let totalCount = 100;
    Novels.count(query, function (err, count) {
        if (!err) {
            totalCount = count
        }
    });

    if (Number.isInteger(page)) {
        title = `SEARCH: ${keyword}`;
        config['title_home'] = `Search: ${keyword} - Read Novel Online 2021`
        config['web_desc'] = `Read best Search: The novels online free, Read daily updated Search: ${keyword} - Read Novel Online 2021`

        let novels_hot = [];
        if (cache.get('hot_novels')) {
            novels_hot = cache.get('hot_novels');
        } else {
            Novels.find({ hot: true }, { novel_name: 1, novel_id: 1, novel_genres: 1 }, function (err, results) {
                if (!err) {
                    novels_hot = results;
                    cache.set('hot_novels', results);
                }
            }).limit(10).sort({ crawler_date: 1 }).lean();
        }


        Novels.find(query, function (err, novels) {
            if (!err && title) {
                var md = new MobileDetect(req.headers['user-agent']);
                let isMobile = md.mobile() ? true : false;
                res.render('client/pages/list-search-novel', {
                    layout: 'layout.hbs',
                    novels: novels,
                    isMobile: isMobile,
                    novels_hot: novels_hot,
                    config: config,
                    title: title,
                    currentPage: page,
                    typeSort: 'test',
                    keyword: keyword,
                    pagination: {
                        page: page,
                        pageCount: Math.ceil(totalCount / 20)
                    }
                });
            }
        }).sort(sort).limit(20).skip(skip).lean();

    } else {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config
        });
    }
})


router.get('/sort/:typeSort/:status?', function (req, res) {
    let config = cache.get("config");
    const typeSort = req.params.typeSort;
    const status = req.params.status || null;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 20;
    let query = {};
    let title = '';
    let showSuggestion = true;
    let sort = { crawler_date: -1 }
    let totalCount = 100;
    if (status == 'completed') {
        query['novel_status'] = 1;
    }

    if (typeSort && Number.isInteger(page)) {
        switch (typeSort) {
            case process.env.URL_LASTEST:
                title = 'LATEST RELEASE NOVELS';
                config['title_home'] = `Latest Release Novels 2021 - ${util.getDomainDesc()}`
                config['web_desc'] = `Read best Latest Release Novels novels online free, Read daily updated Latest Release Novels - ${util.getDomainDesc()}`
                break;
            case process.env.URL_HOT_NOVEL:
                title = 'HOT NOVELS';
                config['title_home'] = `Hot Novels - ${util.getDomainDesc()}`
                config['web_desc'] = `Read best Hot Novels novels online free, Read daily updated Hot Novels - ${util.getDomainDesc()}`
                query['hot'] = true;
                break;
            case process.env.URL_POPULAR_NOVEL:
                title = 'MOST POPULAR NOVELS';
                config['title_home'] = 'Most Popular Novels - Read Novel Online 2021';
                config['web_desc'] = `Read best Most Popular Novels novels online free, Read daily updated Most Popular Novels - ${util.getDomainDesc()}`;
                sort = { view: -1 };
                break;
            case process.env.URL_COMPLETED_NOVEL:
                title = 'COMPLETED NOVELS';
                config['title_home'] = `Completed Novels - ${util.getDomainDesc()}`;
                config['web_desc'] = `Read best Completed Novels novels online free, Read daily updated Completed Novels - ${util.getDomainDesc()}`;
                query['novel_status'] = 1;
                showSuggestion = false;
                break;
            case process.env.URL_ONGOING_NOVEL:
                config['title_home'] = `Ongoing Novels - ${util.getDomainDesc()}`;
                config['web_desc'] = `Read best Ongoing Novels novels online free, Read daily updated Ongoing Novels - ${util.getDomainDesc()}`;

                title = 'ONGOING NOVELS';
                query['novel_status'] = 0;
                showSuggestion = false;
                break;
            default:
                break;
        }
        let novels_hot = [];
        if (cache.get('hot_novels')) {
            novels_hot = cache.get('hot_novels');
        } else {
            Novels.find({ hot: true }, { novel_name: 1, novel_id: 1, novel_genres: 1 }, function (err, results) {
                if (!err) {
                    novels_hot = results;
                    cache.set('hot_novels', results);
                }
            }).limit(10).sort({ crawler_date: 1 }).lean();
        }

        Novels.count(query, function (err, count) {
            if (!err) {
                totalCount = count
            }
        });
        Novels.find(query, function (err, novels) {
            if (!err && title) {
                var md = new MobileDetect(req.headers['user-agent']);
                let isMobile = md.mobile() ? true : false;
                res.render('client/pages/novel-sort', {
                    layout: 'layout.hbs',
                    novels: novels,
                    isMobile: isMobile,
                    novels_hot: novels_hot,
                    config: config,
                    title: title,
                    status: status,
                    currentPage: page,
                    showSuggestion: showSuggestion,
                    typeSort: typeSort,
                    pagination: {
                        page: page,
                        pageCount: Math.ceil(totalCount / 20)
                    }
                });
            }
        }).sort(sort).limit(20).skip(skip).lean();

    } else {
        res.render('client/pages/404', {
            layout: 'layout.hbs',
            config: config
        });
    }
});


router.get('/ajax/latest-novels', function (req, res) {
    const genre = req.query.genre.toUpperCase();
    let query = {};
    if (genre !== 'ALL') {
        query = { novel_genres: genre };
    }
    Novel.find(query, function (err, novels) {
        res.render('client/pages/search/search-lastest', {
            layout: 'search.hbs',
            novels: novels
        });
    }).sort({ crawler_date: -1 }).lean().limit(24);
})

router.get('/ajax/chapter-archive', function (req, res) {
    const novel_id = req.query.novelId;
    Chapter.find({ "novel.novel_id": novel_id }, { chapter_name: 1, chapter_id: 1 }, function (err, chapters) {
        if (!err) {
            let chapters_chunk = chapters.chunk_inefficient(15);
            for (let index = 0; index < chapters_chunk.length; index++) {
                chapters_chunk[index] = chapters_chunk[index].chunk_inefficient(5);
            }
            res.render('client/pages/search/search-list-chapter', {
                layout: 'search.hbs',
                novel_id: novel_id,
                chapters_chunk: chapters_chunk
            });

        }
    }).lean();

})


router.post(`/ajax/rate-novel`, csrfProtection, function (req, res) {
    const novel_id = req.body.id.trim();
    console.log('novel_id = '+ novel_id)
    const ratePoint = Number(req.body.value);
    Novel.findOneAndUpdate({ "novel_id": novel_id }, { $inc: { "voteCountType2": 1 } }, { returnOriginal: false, new: true }, function (err, novel) {
        if (!err) {
            let avgPoint = novel.avgPointType2 ? novel.avgPointType2 : 7;
            let newAvgPoint = ((novel.voteCountType2 - 1) * avgPoint + ratePoint) / novel.voteCountType2;
            Novel.findOneAndUpdate({ "novel_id": novel_id }, { avgPointType2: newAvgPoint }, function (err, novel) {
                if (!err) {
                    res.json(true)
                }
            })
        } else {
            console.log(err)
        }
    });

});

router.get('/ajax/hot-novels', function (req, res) {
    let query = {};
    let genre = req.query.genre;
    if (genre && genre !== 'all') {
        if (genre == 'Arts') {
            genre = 'Martial Arts';
        }
        if (genre == 'Ai') {
            genre = 'Shounen Ai';
        }
        query = { "novel_genres": genre.toUpperCase().trim() }
    }
    Novels.find(query, { novel_name: 1, novel_id: 1, novel_status: 1 }, function (err, novels) {
        if (!err) {
            res.render('client/pages/search/search-hot', {
                layout: 'search.hbs',
                novels: novels
            });
        }
    }).sort({ view: -1 }).lean().limit(13)
})
router.get('/ajax/chapter-option', function (req, res) {
    const novel_id = req.query.novelId;
    const chapter_id = req.query.currentChapterId;
    Chapter.find({ "novel.novel_id": novel_id }, { chapter_name: 1, chapter_id: 1 }, function (err, chapters) {
        if (!err) {
            res.render('client/pages/search/search-chapter', {
                layout: 'search.hbs',
                chapters: chapters,
                novel_id: novel_id
            });
        }
    }).lean();
})

module.exports = router;