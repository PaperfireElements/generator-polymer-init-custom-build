/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const camel = require('to-camel-case');
const chalk = require('chalk');
const path = require('path');
const yeoman = require('yeoman-generator');

module.exports = yeoman
  .Base
  .extend({
    prompting: function () {
      this.log(chalk.yellow(`
    =====================================================================
    =       ===================================    ======================
    =  ====  =================================  ==  =====================
    =  ====  =================================  =========================
    =  ====  ===   ===    ====   ===  =   ===    =====  ==  =   ====   ==
    =       ===  =  ==  =  ==  =  ==    =  ===  ==========    =  ==  =  =
    =  ===========  ==  =  ==     ==  ========  ======  ==  =======     =
    =  =========    ==    ===  =====  ========  ======  ==  =======  ====
    =  ========  =  ==  =====  =  ==  ========  ======  ==  =======  =  =
    =  =========    ==  ======   ===  ========  ======  ==  ========   ==
    =====================================================================
        `));
      this.log('Welcome to the ' + chalk.yellow('Paperfire') + ' app generator.');
      this.log('\nLet\'s get started by choosing a few options');
      this.log(chalk.red('=>'));

      const prompts = [
        {
          type: 'input',
          name: 'appName',
          message: 'What is the name of your app?',
          default: this.appname
        }, {
          type: 'input',
          name: 'appDescription',
          message: 'Describe your app',
          default: 'My awesome app.'
        }, {
          type: 'input',
          name: 'appShell',
          message: 'What name do you want to give your root element? (format: my-element)',
          default: 'app-shell'
        }, {
          default: 0,
          type: 'list',
          name: 'appLayout',
          message: 'What layout would you like to use for your app?',
          choices: ['Drawer & Header Layout', 'Header Layout', 'Toolbar Layout', 'Simple Page']
        }, {
          type: 'input',
          name: 'author',
          message: 'What\'s your Github username',
          default: '',
          store: true
        }
      ];

      function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
      }

      return this
        .prompt(prompts)
        .then(function (props) {
          props.appShellClass = capitalize(camel(props.appShell));
          props.appProjectName = props.appName.replace(' ', '-');
          this.props = props;
        }.bind(this));
    },
    writing: function () {
      const appShell = this.props.appShell;
      let pskPath = path.join(path.dirname(this.resolved), 'paperfire-app');

      this.sourceRoot(pskPath);

      // Copy the PSK files
      this
        .fs
        .copyTpl(`${this.templatePath()}/**/!(_)*`, this.destinationPath(), this.props);

      let pathToConditionals = '_conditionalFiles/';

      // Copy AppShell template
      let pathToAppShell = pathToConditionals;
      switch (this.props.appLayout) {
        case 'Header Layout':
          pathToAppShell += 'layout/_app-shell@header.html';
          break;
        case 'Toolbar Layout':
          pathToAppShell += 'layout/_app-shell@toolbar.html';
          break;
        case 'Simple Page':
          pathToAppShell += 'layout/_app-shell@simple.html';
          this
            .fs
            .copyTpl(`${this.templatePath()}/_conditionalFiles/bower/_simple.json`, this.destinationPath('bower.json'), this.props);
          break;
        case 'Drawer & Header Layout':
        default:
          pathToAppShell += 'layout/_app-shell@drawer.html';
      }
      this
        .fs
        .copyTpl(this.templatePath(pathToAppShell), this.destinationPath(`src/${appShell}.html`), this.props);

      // Copy explicitly the PSK dotfiles
      this
        .fs
        .copy(this.templatePath('{.eslintrc.json,.gitattributes,.gitignore}'), this.destinationPath());

      this.sourceRoot(path.join(path.dirname(this.resolved)));

      // Copy the new files
      this
        .fs
        .copy(this.templatePath('gulpfile.js'), this.destinationPath('gulpfile.js'));

      // Overwrite the PSK files with new files this   .fs
      // .copy(this.templatePath('{package.json,README.md}'), this.destinationPath());
    },

    install: function () {
      this.installDependencies();
      this.log('All dependencies have been installed you shold be good to go.');

    },

    end: function () {
      this.log('All finished! Happy coding!');

      this.log(`\nTo continue setting up Firebase make sure you have ${chalk.red('firebase-cli')} https://firebase.google.com/docs/cli/ installed and run:\n\nfirebase init \n\n to setup project with firebase`);
    }
  });
