const Command = require('../../base')
const { getAddons, deleteAddon } = require('../../utils/api/addons')

class addonsDeleteCommand extends Command {
  async run() {
    await this.authenticate()
    const { args } = this.parse(addonsDeleteCommand)
    const accessToken = this.global.get('accessToken')

    if (!accessToken) {
      this.error(`Not logged in`)
    }

    const addonName = args.name

    const siteId = this.site.get('siteId')

    if (!siteId) {
      console.log('No site id found, please run inside a site folder or `netlify link`')
      return false
    }

    const addons = await getAddons(siteId, accessToken)

    if (typeof addons === 'object' && addons.error) {
      console.log('API Error', addons)
      return false
    }

    // Filter down addons to current args.name
    const currentAddon = addons.reduce((acc, current) => {
      if (current.service_path && current.service_path.replace('/.netlify/', '') === addonName) {
        return current
      }
      return {}
    }, addons)

    // If we need flags here
    // const rawFlags = parseRawFlags(raw)
    // console.log('rawFlags', rawFlags)

    if (!currentAddon.id) {
      console.log(`No addon "${addonName}" found for site. Addon already deleted or never existed!`)
      console.log(`> Run \`netlify addons:create ${addonName}\` to create an instance for this site`)
      return false
    }

    const settings = {
      siteId: siteId,
      addon: addonName,
      instanceId: currentAddon.id
    }
    const addonResponse = await deleteAddon(settings, accessToken)

    if (addonResponse.code === 404) {
      console.log(`No addon "${addonName}" found. Please double check your addon name and try again`)
      return false
    }
    this.log(`Addon "${addonName}" deleted`)
  }
}

addonsDeleteCommand.description = `Remove an addon extension to your site
...
Addons are a way to extend the functionality of your Netlify site
`

// allow for any flags. Handy for variadic configuration options
addonsDeleteCommand.strict = false

addonsDeleteCommand.args = [
  {
    name: 'name',
    required: true,
    description: 'addon namespace'
  }
]

addonsDeleteCommand.hidden = true

module.exports = addonsDeleteCommand
