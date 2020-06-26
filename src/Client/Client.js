'use strict';

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

/**
 * @name Client
 * @type Class
 * @description Main application class
 */
class Client {
  /**
   * @type constructor
   * @param clientConfig ClientConfig instance
   */
  constructor(clientConfig) {
    this.secretsPath = path.resolve(__dirname, '../secrets');
    this.credentialsFilePath = path.resolve(
      this.secretsPath,
      'credentials.json',
    );
    this.serviceFilePath = path.resolve(this.secretsPath, 'service.json');
    this.tokenFilePath = path.resolve(this.secretsPath, 'token.json');
    this.scope = clientConfig.scope;
    this.client = null;
  }

  /**
   * @name oAuth2ClientInit
   * @type method
   * @description Initialize the oAuth2Client of the instance
   */
  async oAuth2ClientInit() {
    try {
      const credentials = await this.getFileData(this.credentialsFilePath);

      const { client_id, client_secret, redirect_uris } = credentials.installed;

      this.client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
      );

      this.modulesInit();
    } catch (error) {
      console.error('Error gettin the credentials:\n', error);
    }
  }

  /**
   * @name serviceClientInit
   * @type method
   * @description Initialize the ServiceClient of the instance
   */
  async serviceClientInit() {
    try {
      // TODO: Service client init
      this.client = null;

      this.modulesInit();
    } catch (error) {
      console.error('Error gettin the credentials:\n', error);
    }
  }

  /**
   * @name modulesInit
   * @type method
   * @description Initialize modules (classroom, calendar etc.)
   */
  modulesInit() {
    try {
      this.classroom = google.classroom({
        version: 'v1',
        auth: this.client,
      });

      this.calendar = google.calendar({
        version: 'v3',
        auth: this.client,
      });
    } catch (error) {
      console.error('Error modules init:\n', error);
    }
  }

  /**
   * @name getFileData
   * @type method
   * @description Get the file path (string), read, parse and return JSON file data
   * @param {string} filePath
   * @returns {Object} fileData
   */
  async getFileData(filePath) {
    return JSON.parse(await fs.readFile(filePath));
  }

  /**
   * @name authorize
   * @type method
   * @description Read the token data and set it into authorize credentials
   */
  async authorize() {
    // TODO: Create the ppolymorphic authorize method
    try {
      try {
        const token = await this.getFileData(this.tokenFilePath);
        this.client.setCredentials(token);
      } catch (error) {
        await this.getNewToken();
        const token = await this.getFileData(this.tokenFilePath);
        this.client.setCredentials(token);
      }
    } catch (error) {
      console.error('Authorization error:\n', error);
    }
  }

  /**
   * Get and store new token after prompting for user oAuth2Client authorization
   *
   * @name getNewToken
   * @type method
   * @description Get and store new token after prompting for user authorization
   * @returns {Promise}
   */
  async getNewToken() {
    const authUrl = this.client.generateAuthUrl({
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
            (await this.client.getToken(code)).tokens,
          );
          await fs.writeFile(this.tokenFilePath, token);
          console.log('Token stored into ', this.tokenFilePath);
          resolve();
        } catch (error) {
          console.error('Error retrieving access token', error);
          reject(error);
        }
      });
    });
  }

  /**
   * @name getCourses
   * @type method
   * @description Return courses
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
   * @name getEvents
   * @type method
   * @description Return events
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
}

module.exports = Client;
