import os from 'os';
import { promises as fs } from 'fs';
import { resolve as resolvePath } from 'path';
import { parse as parseUrl } from 'url';
import axios from 'axios';


const createFileNameFromUrl = (url, ext = 'html', template = /[^\w]/gi) => {
  const { hostname, path } = parseUrl(url);
  const hostName = hostname.replace(template, '-');
  const pathName = path.replace(template, '-');
  return `${hostName}${pathName}.${ext}`;
};

const getDataFromPage = url => axios.get(url)
  .then(response => response.data);

const loadPage = (url, dirName) => {
  const dir = dirName || os.tmpdir();
  const fileName = createFileNameFromUrl(url);
  const filepath = resolvePath(dir, fileName);

  return getDataFromPage(url)
    .then(data => fs.writeFile(filepath, data, 'utf-8'))
    .then(() => console.log(`Page loaded to ${filepath} succsessfully!`));
};

export default loadPage;
