const fs = require('fs').promises;
const readline = require('readline');
const { google } = require('googleapis');

/**
 * Client class ('main' class of the application)
 *
 * @name Client
 */
class Client {
  /**
   * @param {string} credentialsPath
   * @param {string} tokenPath
   * @param {String[]} scope
   */
  constructor(credentialsPath, tokenPath, scope) {
    this.credentialsPath = credentialsPath;
    this.tokenPath = tokenPath;
    this.scope = scope;
  }

  /**
   * Initialize the 'main' instances of the application by reading the credentials
   *
   * @name init
   */
  async init() {
    try {
      const credentials = await this.getCredentials(this.credentialsPath);

      const { client_id, client_secret, redirect_uris } = credentials.installed;

      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
      );

      this.classroom = google.classroom({
        version: 'v1',
        auth: this.oAuth2Client,
      });

      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oAuth2Client,
      });
    } catch (error) {
      console.error('Error gettin the credentials:\n', error);
    }
  }

  /**
   * Get the credentialsPath string, read the `credentials.json` file and return the JSON
   *
   * @name getCredentials
   * @param {string} credentialsPath
   * @returns {Object}
   */
  async getCredentials(credentialsPath) {
    return JSON.parse(await fs.readFile(credentialsPath));
  }

  /**
   * Get the tokenPath string, read the `token.json` file and return the JSON
   *
   * @name getToken
   * @param {string} tokenPath
   * @returns {Object}
   */
  async getToken(tokenPath) {
    return JSON.parse(await fs.readFile(tokenPath));
  }

  /**
   * Read the token data and set it into oAuth2Client credentials
   *
   * @name authorize
   */
  async authorize() {
    try {
      try {
        const token = await this.getToken(this.tokenPath);
        this.oAuth2Client.setCredentials(token);
      } catch (error) {
        await this.getNewToken();
        const token = await this.getToken(this.tokenPath);
        this.oAuth2Client.setCredentials(token);
      }
    } catch (error) {
      console.error('Authorization error:\n', error);
    }
  }

  /**
   * Get and store new token after prompting for user authorization
   *
   * @name getNewToken
   */
  async getNewToken() {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scope,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        try {
          const token = JSON.stringify(
            (await this.oAuth2Client.getToken(code)).tokens,
          );
          await fs.writeFile(this.tokenPath, token);
          console.log('Token stored into ', this.tokenPath);
          resolve();
        } catch (error) {
          console.error('Error retrieving access token', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Get the courses
   *
   * @returns {Object} courses
   */
  async getCourses() {
    try {
      const coursesConfig = {
        pageSize: 10,
      };
      const response = await this.classroom.courses.list(coursesConfig);
      const courses = response.data.courses;
      return courses;
    } catch (error) {
      console.error('The API returned an error: ' + error);
    }
  }

  /**
   * Get the events
   *
   * @returns {Object} events
   */
  async getEvents() {
    try {
      const eventsConfig = {
        calendarId: 'classroom117052918651942363490@group.calendar.google.com',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      };
      const response = await this.calendar.events.list(eventsConfig);
      const events = response.data.items;
      return events;
    } catch (error) {
      console.error('The API returned an error: ' + error);
    }
  }

  // async createCourse(courseData) {
  //   try {
  //     const result = await this.classroom.courses.create(courseData);
  //     console.log(result);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}

module.exports = Client;
