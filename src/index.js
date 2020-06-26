'use strict';

const Client = require('./Client/Client');
const ClientConfig = require('./Client/ClientConfig');

const { printCourses, printEvents } = require('./helpers');

const { SCOPES } = require('./secrets/config');

(async () => {
  try {
    const clientConfig = new ClientConfig(SCOPES);
    const client = new Client(clientConfig);
    await client.oAuth2ClientInit();
    await client.authorize();

    const courses = await client.getCourses();
    printCourses(courses);

    const events = await client.getEvents();
    printEvents(events);
  } catch (error) {
    console.error('Authentication error\n', error);
  }
})();
