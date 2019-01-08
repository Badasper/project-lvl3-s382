import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

nock.disableNetConnect();
const host = 'https://hexlet.io';

const pagePath = '/courses';
const cssPath = '/assets/css/main.css';
const imgPath = '/assets/img/potato_fest.jpg';
const jsPath = '/assets/js/main.js';

let pageBody;
let pageBodyLocal;
let pageCss;
let pageImg;
let pageJs;

beforeAll(async () => {
  const filePathIndex = path.resolve(__dirname, '__fixtures__', 'index.html');
  pageBody = await fs.readFile(filePathIndex, 'utf-8');

  const filePathIndexLocal = path.resolve(__dirname, '__fixtures__', 'index_local.html');
  pageBodyLocal = await fs.readFile(filePathIndexLocal, 'utf-8');

  const filePathCss = path.resolve(__dirname, '__fixtures__', `.${cssPath}`);
  pageCss = await fs.readFile(filePathCss, 'utf-8');

  const filePathImg = path.resolve(__dirname, '__fixtures__', `.${imgPath}`);
  pageImg = await fs.readFile(filePathImg, 'utf-8');

  const filePathJs = path.resolve(__dirname, '__fixtures__', `.${jsPath}`);
  pageJs = await fs.readFile(filePathJs, 'utf-8');
});

beforeEach(() => {
  nock(host)
    .get(pagePath)
    .reply(200, pageBody);

  nock(host)
    .get(cssPath)
    .reply(200, pageCss);

  nock(host)
    .get(imgPath)
    .reply(200, pageImg);

  nock(host)
    .get(jsPath)
    .reply(200, pageJs);
});

describe('Read data from nock server', () => {
  it('#Read raw body', async () => {
    const outDirName = await fs.mkdtemp(path.join(os.tmpdir(), 'page-hexlet-'));
    const indexFilePath = path.resolve(outDirName, 'hexlet-io-courses.html');
    await loadPage(`${host}${pagePath}`, outDirName);
    const data = await fs.readFile(indexFilePath, 'utf-8');
    expect(data).toBe(pageBodyLocal);
  });

  it('#Read assets img/css/js', async () => {
    const outDirName = await fs.mkdtemp(path.join(os.tmpdir(), 'page-hexlet-2-'));
    await loadPage(`${host}${pagePath}`, outDirName);
    const assetsDir = 'hexlet-io-courses_files';

    const imgFilePath = path.resolve(outDirName, assetsDir, 'assets-img-potato-fest.jpg');
    const img = await fs.readFile(imgFilePath, 'utf-8');
    expect(img).toBe(pageImg);

    const cssFilePath = path.resolve(outDirName, assetsDir, 'assets-css-main.css');
    const css = await fs.readFile(cssFilePath, 'utf-8');
    expect(css).toBe(pageCss);

    const jsFilePath = path.resolve(outDirName, assetsDir, 'assets-js-main.js');
    const js = await fs.readFile(jsFilePath, 'utf-8');
    expect(js).toBe(pageJs);
  });
});
