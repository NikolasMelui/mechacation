'use strict';

/**
 * @name ClientConfig
 * @type Class
 * @description Config for the 'Client' class
 */
class ClientConfig {
  constructor(scope = []) {
    /**
     * @param {String[]} scope Scope of the Google applications
     */
    this.scope = scope;
  }
}

module.exports = ClientConfig;
