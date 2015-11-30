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
	var TEMPLATE =
		'<div class="systemTagsContainer">' +
		'HELLO TAGS!' +
		'</div>';

	/**
	 * @class OCA.SystemTags.SystemTagsView
	 * @classdesc
	 *
	 * Displays a file's system tags
	 *
	 */
	var SystemTagsView = OCA.Files.DetailFileInfoView.extend(
		/** @lends OCA.SystemTags.SystemTagsView.prototype */ {

		className: 'systemTagsView',

		template: function(data) {
			if (!this._template) {
				this._template = Handlebars.compile(TEMPLATE);
			}
			return this._template(data);
		},

		initialize: function(options) {
			options = options || {};
		},

		_onModelChanged: function() {
			// simply re-render
			this.render();
		},

		setFileInfo: function(fileInfo) {
			if (this.model) {
				this.model.off('change', this._onModelChanged, this);
			}
			this.model = fileInfo;
			if (this.model) {
				this.model.on('change', this._onModelChanged, this);
			}
			this.render();
		},

		/**
		 * Renders this details view
		 */
		render: function() {
			if (this.model) {
				this.$el.html(this.template({
					// TODO
				}));

				this.$el.find('[title]').tooltip({placement: 'bottom'});
			} else {
				this.$el.empty();
			}
			this.delegateEvents();
		}
	});

	OCA.SystemTags.SystemTagsView = SystemTagsView;
})();

