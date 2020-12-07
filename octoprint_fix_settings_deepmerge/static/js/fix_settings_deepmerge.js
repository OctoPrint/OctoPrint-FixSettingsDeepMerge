/*
 * View model for OctoPrint-FixSettingsDeepMerge
 *
 * Author: Gina Häußge
 * License: AGPLv3
 */
$(function() {
    function FixSettingsDeepmergeViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];

        var deepMerge = function(target, source) {
            /**
             * Implements an object deep merge, which contrary to _.merge doesn't try to
             * merge arrays.
             */
            if (!_.isObject(target)) {
                return target;
            }

            _.forOwn(source, function (value, key) {
                if (
                    target.hasOwnProperty(key) &&
                    _.isPlainObject(target[key]) &&
                    _.isPlainObject(value)
                ) {
                    target[key] = deepMerge(target[key], value);
                } else {
                    target[key] = value;
                }
            });

            return target;
        }

        var patchedGetLocalData = function() {
            var data = {};
            if (self.settingsViewModel.settings !== undefined) {
                data = ko.mapping.toJS(self.settingsViewModel.settings);
            }

            // some special read functions for various observables
            var specialMappings = {
                feature: {
                    autoUppercaseBlacklist: function () {
                        return splitTextToArray(
                            self.settingsViewModel.feature_autoUppercaseBlacklist(),
                            ",",
                            true
                        );
                    }
                },
                serial: {
                    additionalPorts: function () {
                        return commentableLinesToArray(self.settingsViewModel.serial_additionalPorts());
                    },
                    additionalBaudrates: function () {
                        return _.map(
                            splitTextToArray(
                                self.settingsViewModel.serial_additionalBaudrates(),
                                ",",
                                true,
                                function (item) {
                                    return !isNaN(parseInt(item));
                                }
                            ),
                            function (item) {
                                return parseInt(item);
                            }
                        );
                    },
                    blacklistedPorts: function () {
                        return commentableLinesToArray(self.settingsViewModel.serial_blacklistedPorts());
                    },
                    blacklistedBaudrates: function () {
                        return _.map(
                            splitTextToArray(
                                self.settingsViewModel.serial_blacklistedBaudrates(),
                                ",",
                                true,
                                function (item) {
                                    return !isNaN(parseInt(item));
                                }
                            ),
                            function (item) {
                                return parseInt(item);
                            }
                        );
                    },
                    longRunningCommands: function () {
                        return splitTextToArray(
                            self.settingsViewModel.serial_longRunningCommands(),
                            ",",
                            true
                        );
                    },
                    checksumRequiringCommands: function () {
                        return splitTextToArray(
                            self.settingsViewModel.serial_checksumRequiringCommands(),
                            ",",
                            true
                        );
                    },
                    blockedCommands: function () {
                        return splitTextToArray(self.settingsViewModel.serial_blockedCommands(), ",", true);
                    },
                    pausingCommands: function () {
                        return splitTextToArray(self.settingsViewModel.serial_pausingCommands(), ",", true);
                    },
                    emergencyCommands: function () {
                        return splitTextToArray(
                            self.settingsViewModel.serial_emergencyCommands(),
                            ",",
                            true
                        );
                    },
                    externalHeatupDetection: function () {
                        return !self.settingsViewModel.serial_disableExternalHeatupDetection();
                    },
                    alwaysSendChecksum: function () {
                        return self.settingsViewModel.serial_sendChecksum() === "always";
                    },
                    neverSendChecksum: function () {
                        return self.settingsViewModel.serial_sendChecksum() === "never";
                    },
                    ignoreErrorsFromFirmware: function () {
                        return self.settingsViewModel.serial_serialErrorBehaviour() === "ignore";
                    },
                    disconnectOnErrors: function () {
                        return self.settingsViewModel.serial_serialErrorBehaviour() === "disconnect";
                    }
                },
                scripts: {
                    gcode: function () {
                        // we have a special handler function for the gcode scripts since the
                        // server will always send us those that have been set already, so we
                        // can't depend on all keys that we support to be present in the
                        // original request we iterate through in mapFromObservables to
                        // generate our response - hence we use our observables instead
                        //
                        // Note: If we ever introduce sub categories in the gcode scripts
                        // here (more _ after the prefix), we'll need to adjust this code
                        // to be able to cope with that, right now it only strips the prefix
                        // and uses the rest as key in the result, no recursive translation
                        // is done!
                        var result = {};
                        var prefix = "scripts_gcode_";
                        var observables = _.filter(_.keys(self), function (key) {
                            return _.startsWith(key, prefix);
                        });
                        _.each(observables, function (observable) {
                            var script = observable.substring(prefix.length);
                            result[script] = self[observable]();
                        });
                        return result;
                    }
                },
                temperature: {
                    profiles: function () {
                        var result = [];
                        _.each(self.settingsViewModel.temperature_profiles(), function (profile) {
                            try {
                                result.push({
                                    name: profile.name,
                                    extruder: Math.floor(
                                        _.isNumber(profile.extruder)
                                            ? profile.extruder
                                            : parseInt(profile.extruder)
                                    ),
                                    bed: Math.floor(
                                        _.isNumber(profile.bed)
                                            ? profile.bed
                                            : parseInt(profile.bed)
                                    ),
                                    chamber: Math.floor(
                                        _.isNumber(profile.chamber)
                                            ? profile.chamber
                                            : _.isNumber(parseInt(profile.chamber))
                                            ? parseInt(profile.chamber)
                                            : 0
                                    )
                                });
                            } catch (ex) {
                                // ignore
                            }
                        });
                        return result;
                    }
                }
            };

            var mapFromObservables = function (data, mapping, keyPrefix) {
                var flag = false;
                var result = {};

                // process all key-value-pairs here
                _.forOwn(data, function (value, key) {
                    var observable = key;
                    if (keyPrefix !== undefined) {
                        observable = keyPrefix + "_" + observable;
                    }

                    if (self.settingsViewModel.observableCopies.hasOwnProperty(observable)) {
                        // only a copy, skip
                        return;
                    }

                    if (mapping && mapping[key] && _.isFunction(mapping[key])) {
                        result[key] = mapping[key]();
                        flag = true;
                    } else if (_.isPlainObject(value)) {
                        // value is another object, we'll dive deeper
                        var subresult = mapFromObservables(
                            value,
                            mapping && mapping[key] ? mapping[key] : undefined,
                            observable
                        );
                        if (subresult !== undefined) {
                            // we only set something on our result if we got something back
                            result[key] = subresult;
                            flag = true;
                        }
                    } else if (self.settingsViewModel.hasOwnProperty(observable)) {
                        result[key] = self.settingsViewModel[observable]();
                        flag = true;
                    }
                });

                // if we set something on our result (flag is true), we return result, else we return undefined
                return flag ? result : undefined;
            };

            // map local observables based on our existing data
            var dataFromObservables = mapFromObservables(data, specialMappings);

            data = deepMerge(data, dataFromObservables);
            return data;
        }

        self.onAfterBinding = function() {
            self.settingsViewModel.getLocalData = patchedGetLocalData;
            log.info("Fix Settings Deepmerge: Monkey-patch applied!");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: FixSettingsDeepmergeViewModel,
        dependencies: [ "settingsViewModel" ],
    });
});
