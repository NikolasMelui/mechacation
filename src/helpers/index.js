'use strict';

module.exports = {
  printCourses: (courses) => {
    if (courses.length) {
      console.log('Courses:');
      courses.forEach((course) => {
        console.log(`${course.name} (${course.id})`);
      });
    }
  },
  printEvents: (events) => {
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.forEach((event) => {
        console.log(
          `${event.start.dateTime || event.start.date} - ${event.summary}`,
        );
      });
    } else {
      console.log('No upcoming events found.');
    }
  },
};
