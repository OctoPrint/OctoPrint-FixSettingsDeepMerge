# coding=utf-8
from __future__ import absolute_import

import logging

import octoprint.plugin

BROKEN_VERSION = "1.5.0"
FIXED_VERSION = "1.5.2"


class FixSettingsDeepmergePlugin(octoprint.plugin.AssetPlugin):

    ##~~ AssetPlugin mixin

    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        # core UI here.
        return {"js": ["js/fix_settings_deepmerge.js"]}

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return dict(
            fix_settings_deepmerge=dict(
                displayName="Fix Settings Deepmerge Plugin",
                displayVersion=self._plugin_version,
                # version check: github repository
                type="github_release",
                user="OctoPrint",
                repo="OctoPrint-FixSettingsDeepMerge",
                current=self._plugin_version,
                # update method: pip
                pip="https://github.com/OctoPrint/OctoPrint-FixSettingsDeepMerge/archive/{target_version}.zip",
            )
        )


__plugin_name__ = "Fix Settings Deepmerge"
__plugin_pythoncompat__ = ">=2.7,<4"  # python 2 and 3


def __plugin_check__():
    from octoprint.util.version import is_octoprint_compatible

    compatible = is_octoprint_compatible(">={},<{}".format(BROKEN_VERSION, FIXED_VERSION))
    if not compatible:
        logging.getLogger(__name__).info(
            "Plugin is not needed in OctoPrint versions < 1.4.0 or >= 1.4.1"
        )
    return compatible


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = FixSettingsDeepmergePlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
