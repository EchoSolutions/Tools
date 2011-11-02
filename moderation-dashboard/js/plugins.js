// plugin for adding marker class to markers in moderator view

(function($) {

var plugin = Echo.createPlugin({
       "name": "moderatorMarkerClass",
       "applications": ["Stream"],
       "init": function(plugin, application) {
               plugin.extendRenderer("Item", "extraField", plugin.markerClassRenderer);
       }
});

plugin.markerClassRenderer = function(element,dom,extra) {
        var self = this;
        var type = (extra || {}).type;
        if (!this.data.object[type] || !this.user.isAdmin()) {
                element.remove();
                return;
        }
        var items = $.foldl([], this.data.object[type], function(item, acc){
                var template = (item.length > self.config.get("limits." + type))
                        ? "<span title={Data:item}>{Data:truncatedItem}</span>"
                        : "<span class=\'data-{Data:item}'\>{Data:item}</span>";
                var truncatedItem = $.htmlTextTruncate(item, self.config.get("limits." + type), "...");
                acc.push(self.substitute(template, {"item": item, "truncatedItem": truncatedItem}));
        });
        element.prepend(items.sort().join(", "));
};

})(jQuery);

// Editor's Pick One Click

(function($) {

var plugin = Echo.createPlugin({
        "name": "edPicks",
        "applications": ["Stream"],
        "init": function(plugin, application) {

        var callback = function() {
        var item = this;
        item.controls[plugin.name + ".edPicks"].element
                        .empty()
                        .append(plugin.label(name.toLowerCase() + "Processing"));

                $.get(plugin.getSubmissionProxyURL(application), {
                        "appkey": application.config.get("appkey"),
                        "content": $.object2JSON({
                                "verb": "mark",
                                "target": item.id,
                                "markers": "ep"
                        }),
                        "sessionID": item.user.get("sessionID", "")
                }, function(data) {
                        if (data.result == "error") {
                                alert("error");
                        } else {
                        //plugin.changeItemStatus(item, status);
                                application.startLiveUpdates(true);
                        }
                }, "jsonp");


        };

        plugin.addItemControl(application, function() {
            var item = this;
                var markers = item.data.object.markers;
                var containsEp = $.inArray("ep", markers);
                if (containsEp != -1) {
                        var epVisable = false;
                } else {
                        var epVisable = true;
                }
            return {
                "name": "edPicks",
                "label": '<span class="echo-clickable">Make Editors Pick</span>',
                "visible": item.user.isAdmin() && epVisable == true,
                "callback": callback

            };

        });

        }
});

plugin.getSubmissionProxyURL = function(application) {
        return application.config.get(plugin.config("submissionProxyURL"),
        application.config.get("submissionProxyURL"));
};

})(jQuery);
