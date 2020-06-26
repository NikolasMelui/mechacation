'use strict';

const path = require('path');

const Client = require('./Client');

const { printCourses, printEvents } = require('./helpers');

const { SCOPES, CREDENTIALS_PATH, TOKEN_PATH } = require('./config');
const credentialsPath = path.resolve(__dirname, CREDENTIALS_PATH);
const tokenPath = path.resolve(__dirname, TOKEN_PATH);

(async () => {
  try {
    const client = new Client(credentialsPath, tokenPath, SCOPES);
    await client.init();
    await client.authorize();

    const courses = await client.getCourses();
    printCourses(courses);

    const events = await client.getEvents();
    printEvents(events);

    // const courseData = {
    //   name: '10th Grade Biology',
    //   section: 'Period 2',
    //   descriptionHeading: 'Welcome to 10th Grade Biology',
    //   description:
    //     "We'll be learning about about the structure of living creatures from a combination of textbooks, guest lectures, and lab work. Expect to be excited!",
    //   room: '301',
    //   ownerId: 'me',
    //   courseState: 'PROVISIONED',
    // };
    // await client.createCourse(courseData);
  } catch (error) {
    console.error('Authentication error\n', error);
  }
})();
