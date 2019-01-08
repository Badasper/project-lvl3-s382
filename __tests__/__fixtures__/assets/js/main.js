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