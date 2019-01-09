import os from 'os';
import _ from 'lodash';
import cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { resolve, parse, join } from 'path';
import { parse as parseUrl } from 'url';
import axios from 'axios';
import debug from 'debug';

const logName = 'page-loader:';
const log = {
  http: debug(`${logName} http:`),
  files: debug(`${logName} disk operation:`),
  info: debug(`${logName} info:`),
};

const generateName = (pathName, end, template = /[^\w]|[_]/gi) => {
  const { dir, name, ext } = parse(_.trim(pathName, '/'));
  const trimmedPathName = join(dir, name);
  const extention = ext || end || '';
  return `${trimmedPathName.replace(template, '-')}${extention}`;
};

const getDataFromPage = (url, responseType = 'arraybuffer') => axios({
  method: 'get',
  url,
  responseType,
})
  .then(response => response.data)
  .then((data) => {
    log.http('GET %s', url);
    return data;
  });

const getLinksAndModifyHtml = (data, assetsDirName) => {
  const tags = {
    link: 'href',
    script: 'src',
    img: 'src',
  };
  const $ = cheerio.load(data);
  const links = Object.keys(tags).reduce((acc, tag) => {
    let paths = [];
    $(tag).each(function find() {
      const link = $(this).attr(tags[tag]);
      const generatedLink = generateName(link);
      paths = [...paths, link];
      $(this).attr(tags[tag], `${join(assetsDirName, generatedLink)}`);
      log.info('replace link %s by %s', link, generatedLink);
    });
    return [...acc, ...paths];
  }, []);
  return { links, html: $.html() };
};

const saveHtmlAndPushLinks = (htmlFilePath, html, links) => fs.writeFile(htmlFilePath, html, 'utf-8')
  .then(() => log.files('save html %s', htmlFilePath))
  .then(() => links);

const downloadAssets = (links, host, assetsDirPath) => Promise.all(links.map((link) => {
  const filename = generateName(link);
  return getDataFromPage(`${host}/${link}`)
    .then(data => fs.writeFile(resolve(assetsDirPath, filename), data)
      .then(() => log.files('save file %s', resolve(assetsDirPath, filename))));
}));

const handleInputArgs = (url, dirName) => {
  const { hostname, path, protocol } = parseUrl(url);
  const pathName = `${hostname}${path}`;
  const rootDir = dirName || os.tmpdir();
  const indexFileName = generateName(pathName, '.html');
  log.info('generate name for html file=%s', indexFileName);
  const assetsDir = generateName(pathName, '_files');
  log.info('generate name for assets dir=%s', assetsDir);
  return {
    host: `${protocol}//${hostname}`,
    indexFileName,
    rootDir,
    assetsDir,
    assetsDirPath: resolve(rootDir, assetsDir),
  };
};

const loadPage = (url, dirName) => {
  const {
    rootDir,
    indexFileName,
    assetsDir,
    assetsDirPath,
    host,
  } = handleInputArgs(url, dirName);

  return fs.mkdir(assetsDirPath)
    .then(() => getDataFromPage(url))
    .then(data => getLinksAndModifyHtml(data, assetsDir))
    .then(({ links, html }) => saveHtmlAndPushLinks(resolve(rootDir, indexFileName), html, links))
    .then(links => downloadAssets(links, host, assetsDirPath))
    .then(() => log.info('All files downlad succsessfull!'));
};

export default loadPage;
