import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const hostName = 'https://hexlet.io';
const fileName = 'hexlet-io-courses.html';
const filePath = path.resolve(os.tmpdir(), fileName);
const body = '<body><h1>This is a body of html page</h1><p>This Hexlet, bitch</p></body>';

beforeEach(async () => {
  nock(hostName)
    .get('/courses')
    .reply(200, body);
});

describe('Read data from nock server', () => {
  it('#Read body', async () => {
    await loadPage(`${hostName}/courses`);
    const data = await fs.readFile(filePath, 'utf-8');
    expect(data).toBe(body);
  });
});
