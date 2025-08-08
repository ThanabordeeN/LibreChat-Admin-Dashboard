const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { askQuestion, askMultiLineQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

(async () => {
  await connect();

  /**
   * Show the welcome / help menu
   */
  console.purple('--------------------------');
  console.purple('Update the banner!');
  console.purple('--------------------------');
  /**
   * Set up the variables we need and get the arguments if they were passed in
   */
  let displayFrom = '';
  let displayTo = '';
  let message = '';
  let isPublic = undefined;
  // If we have the right number of arguments, lets use them
  if (process.argv.length >= 3) {
    displayFrom = process.argv[2];
    displayTo = process.argv[3];
    message = process.argv[4];
    isPublic = process.argv[5] === undefined ? undefined : process.argv[5] === 'true';
  } else {
    console.orange(
      'Usage: npm run update-banner <displayFrom(Format: yyyy-mm-ddTHH:MM:SSZ)> <displayTo(Format: yyyy-mm-ddTHH:MM:SSZ)> <message> <isPublic(true/false)>',
    );
    console.orange('Note: if you do not pass in the arguments, you will be prompted for them.');
    console.purple('--------------------------');
  }

  /**
   * If we don't have the right number of arguments, lets prompt the user for them
   */
  if (!displayFrom) {
    displayFrom = await askQuestion('Display From (Format: yyyy-mm-ddTHH:MM:SSZ, Default: now):');
  }

  // Validate the displayFrom format (ISO 8601)
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  if (displayFrom && !dateTimeRegex.test(displayFrom)) {
    console.red('Error: Invalid date format for displayFrom. Please use yyyy-mm-ddTHH:MM:SSZ.');
    silentExit(1);
  }

  displayFrom = displayFrom ? new Date(displayFrom) : new Date();

  if (!displayTo) {
    displayTo = await askQuestion(
      'Display To (Format: yyyy-mm-ddTHH:MM:SSZ, Default: not specified):',
    );
  }

  if (displayTo && !dateTimeRegex.test(displayTo)) {
    console.red('Error: Invalid date format for displayTo. Please use yyyy-mm-ddTHH:MM:SSZ.');
    silentExit(1);
  }

  displayTo = displayTo ? new Date(displayTo) : null;

  if (!message) {
    message = await askMultiLineQuestion(
      'Enter your message ((Enter a single dot "." on a new line to finish)):',
    );
  }

  if (message.trim() === '') {
    console.red('Error: Message cannot be empty!');
    silentExit(1);
  }

  if (isPublic === undefined) {
    const isPublicInput = await askQuestion('Is public (y/N):');
    isPublic = isPublicInput.toLowerCase() === 'y' ? true : false;
  }

  try {
    const { updateBanner } = require('./modules/updateBanner');
    const result = await updateBanner({ displayFrom, displayTo, message, isPublic });
    console.green('Banner updated successfully!');
    console.purple(`bannerId: ${result.bannerId}`);
    console.purple(`from: ${result.displayFrom}`);
    console.purple(`to: ${result.displayTo || 'not specified'}`);
    console.purple(`Banner: ${result.message}`);
    console.purple(`isPublic: ${result.isPublic}`);
    silentExit(0);
  } catch (error) {
    console.red('Error: ' + error.message);
    console.error(error);
    silentExit(1);
  }
})();

process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    console.error('There was an uncaught error:');
    console.error(err);
  }

  if (err.message.includes('fetch failed')) {
    return;
  } else {
    process.exit(1);
  }
});
