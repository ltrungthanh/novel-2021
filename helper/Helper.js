require('dotenv').config();
var url = require('url');
var uslug = require('uslug');
var moment = require('moment');


module.exports = {
    paginate: require('handlebars-paginate'),
    addOne: function(value) {
        return value + 1;
    },

    getContactLink: function() {
        return `${process.env.DOMAIN}/${process.env.URL_CONTACT}/`;
    },
    getPolicyLink: function() {
        return `${process.env.DOMAIN}/${process.env.URL_PRIVACY_POLICY}/`;
    },

    getDomain: function() {
        return `${process.env.DOMAIN}/`;
    },
    getDomainDesc: function() {
        return `${process.env.DOMAIN_DESC}`;
    },
    getLastestLink: function() {
        return `${process.env.DOMAIN}/sort/${process.env.URL_LASTEST}/`;
    },
    getHotNovelLink: function() {
        return `${process.env.DOMAIN}/sort/${process.env.URL_HOT_NOVEL}/`;
    },
    getPopularNovelLink: function() {
        return `${process.env.DOMAIN}/sort/${process.env.URL_POPULAR_NOVEL}/`;
    },
    getCompletedNovelLink: function() {
        return `${process.env.DOMAIN}/sort/${process.env.URL_COMPLETED_NOVEL}/`;
    },
    getOngoingNovelLink: function() {
        return `${process.env.DOMAIN}/sort/${process.env.URL_ONGOING_NOVEL}/`;
    },
    getSortNovelLink: function(typeSort, status, pageNumber) {
        let result = '';
        switch (typeSort) {
            case process.env.URL_LASTEST:
                result = `${process.env.DOMAIN}/sort/${process.env.URL_LASTEST}`;
                break;
            case process.env.URL_HOT_NOVEL:
                result = `${process.env.DOMAIN}/sort/${process.env.URL_HOT_NOVEL}`;
                break;
            case process.env.URL_POPULAR_NOVEL:
                result = `${process.env.DOMAIN}/sort/${process.env.URL_POPULAR_NOVEL}`;
                break;
            case process.env.URL_COMPLETED_NOVEL:
                result = `${process.env.DOMAIN}/sort/${process.env.URL_COMPLETED_NOVEL}`;
                break;
            case process.env.URL_ONGOING_NOVEL:
                result = `${process.env.DOMAIN}/sort/${process.env.URL_ONGOING_NOVEL}`;
                break;
            default:
                break;
        }
        if (status) {
            result += `/${status}`;
        }
        if (pageNumber > 1) {
            result += `?page=${pageNumber}`;
        }
        return result;
    },
    getSearchNovelLink: function(keyword, pageNumber) {
        let result = `${process.env.DOMAIN}/search`;
        if (keyword) {
            result += `?keyword=${keyword}`;
        }
        if (pageNumber > 1) {
            result += `&page=${pageNumber}`;
        }
        return result;
    },
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
    getUrlGenre: function() {
        return process.env.URL_GENRE_NOVEL;
    },
    getGenreLink: function(status, genre, pageNumber) {
        let novel_genre = genre.toLowerCase();
        novel_genre = novel_genre.replace(' ', '-');
        let result = `${process.env.DOMAIN}/${process.env.URL_GENRE_NOVEL}/${novel_genre}`;
        if (status) {
            result += `/${status}`;
        }
        if (pageNumber) {
            result += `?page=${pageNumber}`;
        }
        return result;
    },
    getNovelLink: function(novel_id) {
        return `${process.env.DOMAIN}/${process.env.URL_BASE_NOVEL}/${novel_id}`;
    },
    getGenresNovelList: function(list) {
        let results = [];
        for (let index = 0; index < list.length; index++) {
            let genreName = list[index].toLowerCase();
            genreName = genreName.charAt(0).toUpperCase() + genreName.slice(1);
            results.push(genreName);
        }
        return results.join(', ')
    },
    getShortDescription: function(desc) {
        return desc.substring(0, 120);
    },

    getChapterLink: function(novel_id, chapter_id) {
        if (novel_id && chapter_id) {
            return `${process.env.DOMAIN}/${process.env.URL_BASE_NOVEL}/${novel_id}/${chapter_id}`;
        } else {
            return '';
        }
    },
    if_eq: function(a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    },


    if_not_eq: function(a, b, opts) {
        if (a !== b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    },

    getDateTimeAgo: function(dateTime) {
        let isToday = moment(dateTime).isSame(moment(), 'day');
        if (isToday) {
            return moment(dateTime).fromNow();
        }
        let isYesterDay = moment(dateTime).isSame(moment().subtract(1, 'day'), 'day');
        if (isYesterDay) {
            return 'Yesterday';
        }
        return moment(dateTime).format('MM/DD/YYYY');
    },

    getShareImage: function(config) {
        if (config && config.share_image) {
            return config.share_image;
        } else {
            return `${process.env.IMAGE_SERVICE}/images/home_page_${process.env.DOMAIN_NAME}.png`;
        }
    },
    getLogo: function() {
        return `${process.env.IMAGE_SERVICE}/images/logo_${process.env.DOMAIN_NAME}.png`;
    },

    getLogoClient: function(domainName) {
        return `${process.env.IMAGE_SERVICE}/images/logo_${domainName}.png`;
    },
    getHomePageClient: function(domainName) {
        return `${process.env.IMAGE_SERVICE}/images/home_page_${domainName}.png`;
    },
    getavgPoint: function(value) {
        if (value) {
            return parseFloat(value).toFixed(2).toString();
        } else {
            return 0;
        }
    },
    getNovelAvatar: function(fileName) {
        return `${process.env.IMAGE_SERVICE}/novel/${fileName}.jpg`;
    },
    getNovelAvatarV2: function(_idx, fileName) {
        if (_idx == 0) {
            return `${process.env.IMAGE_SERVICE}/novel/${fileName}.jpg`;
        }
        return `${process.env.IMAGE_SERVICE}/novel_150_223/${fileName}.jpg`;
    },
    getNovelAvatarV3: function(fileName, isMobile) {
        if (!isMobile) {
            return `${process.env.IMAGE_SERVICE}/novel_200_89/${fileName}.jpg`;
        } else {
            return `${process.env.IMAGE_SERVICE}/novel_80_113/${fileName}.jpg`;
        }
    },
    getNovelAvatarV4: function(fileName) {
        return `${process.env.IMAGE_SERVICE}/novel_164_245/${fileName}.jpg`;
    },
    selected(option, value) {
        if (option && value) {
            return option.toLowerCase() == value.toLowerCase() ? 'selected' : '';
        } else {
            if (option == 'event') {
                return 'selected';
            }
        }
    },

    formatDate(dt) {
        return (`${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`);
    },

    checked(currentValue) {
        return currentValue ? 'checked' : '';
    },

    buildActionPosts(id) {
        if (id == null || id == undefined) {
            return '/admin/posts';
        } else {
            return (`/admin/posts/edit-post/${id}`)
        }
    },
    buildActionGallery(id, type) {
        if (type == 'image') {
            if (!id) {
                return '/admin/gallery/create/image';
            }
            return (`/admin/gallery/edit/image/${id}`)
        }
        if (type == 'video') {
            if (!id) {
                return '/admin/gallery/create/video';
            }
            return (`/admin/gallery/edit/video/${id}`)
        }
    }
}