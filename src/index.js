'use strict';

const path = require('path');

const Client = require('./Client');

const { printCourses, printEvents } = require('./helpers');

const {
  SCOPES,
  CREDENTIALS_FILE_PATH,
  // SERVICE_FILE_PATH,
  TOKEN_FILE_PATH,
} = require('./config');
const credentialsFilePath = path.resolve(__dirname, CREDENTIALS_FILE_PATH);
// const serviceFilePath = path.resolve(__dirname, SERVICE_FILE_PATH);
const tokenFilePath = path.resolve(__dirname, TOKEN_FILE_PATH);

(async () => {
  try {
    const client = new Client(credentialsFilePath, tokenFilePath, SCOPES);
    await client.init();
    await client.authorize();

    const courses = await client.getCourses();
    printCourses(courses);

    const events = await client.getEvents();
    printEvents(events);
  } catch (error) {
    console.error('Authentication error\n', error);
  }
})();
