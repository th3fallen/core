/*
 * Copyright (c) 2015
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

/* global dav, Backbone */
if(!_.isUndefined(Backbone)) {
	OC.Backbone = Backbone.noConflict();

	(function() {
		var methodMap = {
			'create': 'POST',
			'update': 'PROPPATCH',
			'patch':  'PROPPATCH',
			'delete': 'DELETE',
			'read':   'PROPFIND'
		};

		/**
		 * DAV transport
		 */
		OC.Backbone.davSync = function(method, model, options) {
			options.type = options.type || methodMap[method];

			var params = {};

			// Ensure that we have a URL.
			if (!options.url) {
			  params.url = _.result(model, 'url') || urlError();
			}

			// Ensure that we have the appropriate request data.
			if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
				params.data = JSON.stringify(options.attrs || model.toJSON(options));
			}

			// Don't process data on a non-GET request.
			if (params.type !== 'PROPFIND') {
				params.processData = false;
			}

			// Pass along `textStatus` and `errorThrown` from jQuery.
			var error = options.error;
			options.error = function(xhr, textStatus, errorThrown) {
				options.textStatus = textStatus;
				options.errorThrown = errorThrown;
				if (error) error.call(options.context, xhr, textStatus, errorThrown);
			};

			// Make the request, allowing the user to override any Ajax options.
			if (!options.depth) {
				if (model instanceof OC.Backbone.Collection) {
					options.depth = 1;
				} else {
					options.depth = 0;
				}
			}

			var xhr = options.xhr = OC.Backbone.davCall(_.extend(params, options), model);
			model.trigger('request', model, xhr, options);
			return xhr;
		};

		/**
		 * Convert a single propfind result to JSON
		 */
		var parsePropFindResult = function(result) {
			var props = {
				href: result.href
			};

			_.each(result.propStat, function(propStat) {
				if (propStat.status !== 'HTTP/1.1 200 OK') {
					return;
				}

				for (var key in propStat.properties) {
					props[key] = propStat.properties[key];
				}
			});

			return props;
		};

		var isSuccessStatus = function(status) {
			return status >= 200 && status <= 299;
		};

		OC.Backbone.davCall = function(options) {
			var client = new dav.Client({
				baseUrl: options.url,
				xmlNamespaces: _.extend({
					'DAV:': 'd',
					'http://owncloud.org/ns': 'oc'
				}, options.xmlNamespaces || {})
			});
			client.resolveUrl = function() {
				return options.url;
			};
			// TODO: xhrProvider for headers
			// TODO: add "X-Requested-With" "XMLHttpRequest" header
			if (options.type === 'PROPFIND') {
				client.propFind(
					options.url,
					options.properties || [],
					options.depth
				).then(function(response) {
					if (isSuccessStatus(response.status)) {
						if (_.isFunction(options.success)) {
							var results;
							if (options.depth > 0) {
								results = _.map(response.body, parsePropFindResult);
								if (!options.includeRoot) {
									results.shift();
								}
							} else {
								results = parsePropFindResult(response.body);
							}

							options.success(results);
							return;
						}
						options.error(response);
					}
				});
			} else {
				client.request(
					options.type,
					options.url
				).then(function(result) {
					if (isSuccessStatus(result.status)) {
						if (_.isFunction(options.success)) {
							options.success(result);
							return;
						}
						options.error(result);
					}
				});
			}
		};
	})();
}

