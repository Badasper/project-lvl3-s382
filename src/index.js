import os from 'os';
import _ from 'lodash';
import cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import axios from 'axios';
import debug from 'debug';

const logName = 'page-loader:';
const log = {
  http: debug(`${logName} http:`),
  files: debug(`${logName} disk operation:`),
  info: debug(`${logName} info:`),
};

const generateName = (pathName, end, template = /[^\w]|[_]/gi) => {
  const { dir, name, ext } = path.parse(_.trim(pathName, '/'));
  const trimmedPathName = path.join(dir, name);
  const extention = end || ext || '';
  return `${trimmedPathName.replace(template, '-')}${extention}`;
};

const getDataFromUrl = (pageUrl = '', responseType = 'arraybuffer') => axios({
  method: 'get',
  url: pageUrl,
  responseType,
})
  .then(response => response.data)
  .then((data) => {
    log.http('GET %s', pageUrl);
    return data;
  });

const isCdnLink = link => url.parse(link).host;

const getLinksAndModifyHtml = (data, assetsDirName) => {
  const tags = {
    link: 'href',
    script: 'src',
    img: 'src',
  };
  const $ = cheerio.load(data);
  const links = Object.keys(tags).reduce((acc, tag) => {
    const findedLinks = $(tag).map((idx, item) => {
      const link = $(item).attr(tags[tag]) || '';
      const generatedLink = generateName(link);
      const newLink = path.join(assetsDirName, generatedLink);
      $(item).attr(tags[tag], newLink);
      log.info('replace link %s by %s', link, newLink);
      return link;
    }).get();
    return [...acc, ...findedLinks].filter(el => el);
  }, []);
  return { links, html: $.html() };
};

const saveHtmlAndPushLinks = (htmlFilePath, html, links) => fs.writeFile(htmlFilePath, html, 'utf-8')
  .then(() => log.files('save html %s', htmlFilePath))
  .then(() => links);

const downloadAssets = (links, host, assetsDirPath) => fs.mkdir(assetsDirPath)
  .then(() => Promise.all(links.map((link) => {
    const filename = generateName(link);
    const downloadLink = isCdnLink(link) ? link : url.resolve(host, link);
    return getDataFromUrl(downloadLink)
      .then(data => fs.writeFile(path.resolve(assetsDirPath, filename), data)
        .then(() => log.files('save file %s', path.resolve(assetsDirPath, filename))));
  })));

const handleInputArgs = (pageUrl = '', dirName = '') => {
  const { hostname, pathname, protocol } = url.parse(pageUrl);
  const name = `${hostname}${pathname}`;
  const rootDir = dirName || os.tmpdir();
  const indexFileName = generateName(name, '.html');
  log.info('generate name for html file=%s', indexFileName);
  const assetsDir = generateName(name, '_files');
  log.info('generate name for assets dir=%s', assetsDir);
  const assetsDirPath = path.resolve(rootDir, assetsDir);
  const host = `${protocol}//${hostname}`;
  const indexFilePath = path.resolve(rootDir, indexFileName);

  return {
    host,
    rootDir,
    assetsDir,
    assetsDirPath,
    indexFilePath,
  };
};

const handleError = (err) => {
  const errors = {
    EEXIST: 'Web page is already downloaded, please choose another dir',
    ENOENT: 'Cannot find output dir, please check output dir --output dirToDownload',
    EACCES: 'Permission denied to download dir, please choose another dir',
    ENETUNREACH: 'Bad url for download',
    ECONNREFUSED: 'Please check url or connection',
  };
  const result = errors[err.code];
  if (result) {
    throw new Error(`Loading fail: ${result}`);
  }
  if (err.response) {
    throw new Error(`Loading fail: Unreachable url ${err.response.status}`);
  }
  throw err;
};

const loadPage = (pageUrl, dirName) => {
  const {
    rootDir,
    assetsDir,
    assetsDirPath,
    host,
    indexFilePath,
  } = handleInputArgs(pageUrl, dirName);

  return fs.access(rootDir)
    .then(() => getDataFromUrl(pageUrl))
    .then(data => getLinksAndModifyHtml(data, assetsDir))
    .then(({ links, html }) => saveHtmlAndPushLinks(indexFilePath, html, links))
    .then(links => downloadAssets(links, host, assetsDirPath))
    .then(() => log.info('All files downloded succsessfully!'))
    .then(() => `Download is done ${pageUrl} to ${rootDir}`)
    .catch(err => handleError(err));
};

export default loadPage;
