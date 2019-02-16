const handler = () => {

}

const command = {
  command: 'build',
  aliases: 'b',
  desc: 'Build a production app bundle for use with the DHIS2 app-shell in production',
  handler
}

module.exports = command
