/*
 * Copyright (c) 2015
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

(function() {
	var ALL_DUMMY_TAGS = [
		{id: 1, name: 'Tag one', userVisible: true, userAssignable: true},
		{id: 3, name: 'Tag two', userVisible: false, userAssignable: true},
		{id: 4, name: 'Tag three', userVisible: false, userAssignable: false},
		{id: 6, name: 'Tag four', userVisible: true, userAssignable: true}
	];

	/**
	 * @class OCA.SystemTags.SystemTagsCollection
	 * @classdesc
	 *
	 * Collection of tags assigned to a file
	 *
	 */
	var SystemTagsCollection = OC.Backbone.Collection.extend(
		/** @lends OCA.SystemTags.SystemTagsCollection.prototype */ {

		/**
		 * Id of the file for which to filter activities by
		 *
		 * @var int
		 */
		_objectId: null,

		/**
		 * Type of the object to filter by
		 *
		 * @var string
		 */
		_objectType: 'files',

		model: OCA.SystemTags.SystemTagModel,

		/**
		 * Sets the object id to filter by or null for all.
		 * 
		 * @param {int} objectId file id or null
		 */
		setObjectId: function(objectId) {
			this._objectId = objectId;
		},

		/**
		 * Sets the object type to filter by or null for all.
		 * 
		 * @param {int} objectType file id or null
		 */
		setObjectType: function(objectType) {
			this._objectType = objectType;
		},

		initialize: function(models, options) {
			options = options || {};
			if (!_.isUndefined(options.objectId)) {
				this._objectId = options.objectId;
			}
			if (!_.isUndefined(options.objectType)) {
				this._objectType = options.objectType;
			}
		},

		getTagIds: function() {
			return this.map(function(model) {
				return model.id;
			});
		},

		fetch: function(options) {
			var self = this;

			if (!this._objectType) {
				throw new 'objectType property must be set';
			}

			options = options || {};

			// TODO: real server call
			_.defer(function() {
				var resp = ALL_DUMMY_TAGS;

				// filter by dummy file assignment
				if (self._objectId) {
					resp = _.filter(resp, function(tag) {
						return tag.id === 3 || tag.id === 4;
					});
				}

				self.reset(resp);
				self.trigger('sync', self, resp, options);
				if (_.isFunction(options.success)) {
					options.success(options.context, self, resp, options);
				}
			});
		}

	});

	OCA.SystemTags.SystemTagsCollection = SystemTagsCollection;
})();

