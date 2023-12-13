import { OptionValues } from 'commander'

import { exit } from '../../utils/command-helpers.js'
import { NetlifyLog, intro, outro } from '../../utils/styles/index.js'
import { track } from '../../utils/telemetry/index.js'
import BaseCommand from '../base-command.js'

export const unlink = async (options: OptionValues, command: BaseCommand) => {
  const { site, siteInfo, state } = command.netlify
  const siteId = site.id

  intro('unlink')

  if (!siteId) {
    NetlifyLog.step(`Folder is not linked to a Netlify site. Run 'netlify link' to link it`)
    outro()
    return exit()
  }

  const siteData = siteInfo

  state.delete('siteId')

  await track('sites_unlinked', {
    siteId: siteData.id || siteId,
  })

  if (site) {
    NetlifyLog.success(`Unlinked ${site.configPath} from ${siteData ? siteData.name : siteId}`)
  } else {
    NetlifyLog.success(`Unlinked site`)
  }

  outro()
}
