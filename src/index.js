import os from 'os';
import _ from 'lodash';
import cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { resolve, parse, join } from 'path';
import { parse as parseUrl } from 'url';
import axios from 'axios';


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
  .then(response => response.data);

const getLinksAndModifiedHtml = (data, assetsDirName) => {
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
    });
    return [...acc, ...paths];
  }, []);
  return { links, html: $.html() };
};

const downloadAssets = (links, host, assetsDirPath) =>
  Promise.all(links.map((link) => {
    const filename = generateName(link);
    return getDataFromPage(`https://${host}/${link}`)
      .then(data => fs.writeFile(resolve(assetsDirPath, filename), data));
  }));

const loadPage = (url, dirName) => {
  const { hostname, path } = parseUrl(url);
  const pathName = `${hostname}${path}`;
  const dir = dirName || os.tmpdir();
  const indexFileName = generateName(pathName, '.html');
  const assetsDir = generateName(pathName, '_files');
  const assetsDirPath = resolve(dir, assetsDir);

  return fs.mkdir(assetsDirPath)
    .then(() => getDataFromPage(url))
    .then(data => getLinksAndModifiedHtml(data, assetsDir))
    .then(({ links, html }) => fs.writeFile(resolve(dir, indexFileName), html, 'utf-8')
      .then(() => links))
    .then(links => downloadAssets(links, hostname, assetsDirPath));
};

export default loadPage;
