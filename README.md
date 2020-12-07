# OctoPrint-FixSettingsDeepMerge

Fixes an issue with merging settings in the frontend in OctoPrint 1.5.x. Install this
if you are trying to change list style values in OctoPrint's Settings like blocked commands,
temperature profiles, ignored ports, ... and anything removed doesn't stay removed.

The underlying issue in question will be fixed in OctoPrint 1.6.0, at which point this
plugin will no longer be required. Consequently it will only run on OctoPrint 1.5.x.

See also [this issue on OctoPrint's bug tracker](https://github.com/OctoPrint/OctoPrint/issues/3867).

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/OctoPrint/OctoPrint-FixSettingsDeepMerge/archive/master.zip

