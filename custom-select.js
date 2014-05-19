
// custom-select jQuery plugin

(function($){

    var customSelect = function(element, options){

        var base = this;

        base.$el = $(element);
        base.el = element;

        base.$select = base.$el.find("select");
        base.$options = base.$el.find("option");

        base.defaultOptions = {

            debug: false,

            icons: {
                "open":  "fa-chevron-down",
                "close": "fa-chevron-up"
            },

            // if set, once maxItems is exceeded scrolling kicks in
            maxItems: null,

            openClassName: "open",
            openUpwardClassName: "open-upward",
            forceUpward: false

        };

        base.init = function() {

            // skip mobile browsers using this: http://detectmobilebrowser.com/
            if (typeof jQuery.browser !== "undefined" &&
                typeof jQuery.browser.mobile !== "undefined" &&
                jQuery.browser.mobile) {
                return false;
            }

            // skip IE8 & older, this looks exactly until <selevct> is clicked
            // which for IE8 & older just displays the browser default <option> menu
            if (document.all && !document.addEventListener) {
                return false;
            }

            base.options = $.extend({}, base.defaultOptions, options);

            base.$el.append("<div class='custom-select-custom-menu'><ul></ul></div>");
            base.$menu_list = base.$el.find(".custom-select-custom-menu");

            base.$el.on("click", function(event) {

                event.stopPropagation();
                event.preventDefault();

            });

            base.$select.on("focus mousedown", function(event) {

                event.stopPropagation();
                event.preventDefault();

                base.toggleCustomSelect();

            });

            base.$options.each(function(i, option) {

                var _text = $(option).text(),
                    _value = $(option).attr("value"),
                    _selected = $(option).attr("selected");

                // for "no value" options
                if (typeof _value === "undefined") {
                    _value = _text;
                }

                // for "selected" options
                if (typeof _selected !== "undefined") {
                    _selected = "data-selected='selected'";
                } else {
                    _selected = "";
                }

                base.$menu_list.find("ul").append("<li data-value='"+_value+"' "+_selected+">"+_text+"</li>");

            });

            if (base.options.maxItems) {

                var restricted_height = base.options.maxItems * parseInt(base.$menu_list.find("li").height(), 10);

                base.$menu_list.height(restricted_height + "px").css({"overflow-y":"scroll"});

            }

            base.$el.find("li").on("click", function() {

                var $menu_item = $(this);

                // set original select's value & trigger change event:
                base.$select.val( $menu_item.data("value") ).trigger("change");

                if (base.options.debug) {
                    console.log("menu item clicked", $menu_item.data("value") );
                }

            });

        };

        base.closeCustomSelect = function(target){

            var _open = (base.options.forceUpward ? base.options.openUpwardClassName : base.options.openClassName);

            $(target)
                .removeClass( _open )
                .addClass( base.options.icons.open )
                .removeClass( base.options.icons.close );

        };

        base.toggleCustomSelect = function(){

            var _open = (base.options.forceUpward ? base.options.openUpwardClassName : base.options.openClassName);

            base.$el
                .toggleClass( _open )
                .toggleClass( base.options.icons.open )
                .toggleClass( base.options.icons.close );

            if (base.$el.hasClass(base.options.openUpwardClassName)) {
                base.$menu_list.css({"top": "-" + base.$menu_list.height() + "px" });
            }

        };

        base.add = function(_text, _value){

            // for "no value" options
            if (typeof _value === "undefined") {
                _value = _text;
            }

            base.$menu_list
                .find("ul")
                .append("<li data-value='"+_value+"'>"+_text+"</li>");

            base.$menu_list
                .find("li[data-value='"+_value+"']")
                .on("click", function() {

                    var $menu_item = $(this);

                    // set original select's value & trigger change event:
                    base.$el.find("select")
                        .val( $menu_item.data("value") ).trigger("change");

                    if (base.options.debug) {
                        console.log("menu item clicked", base.$el.find("select").data("value") );
                    }

                });

            base.$select
                .append("<option value='"+_value+"'>"+_text+"</option>");

        };

        base.addOptions = function(options_element_map){

            $(options_element_map).each(function(i, option) {
                base.add(option._text, option._value);
            });

        };

        base.replaceOptions = function(options_element_map){

            base.$menu_list.find("ul").empty();
            base.$select.empty();

            base.addOptions(options_element_map);

        };

        base.init();

        // js that needs to run once

            // dismiss select on "blur"
            $(document).on("click", function() {

                // close them all
                base.closeCustomSelect( base.el );

            });


    };

    $.fn.customSelect = function(options){
        return this.each(function(){

            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('customSelect')) return;

            // pass options to plugin constructor
            var customselect = new customSelect(this, options);

            // Store plugin object in this element's data
            element.data('customSelect', customselect);

        });
    };

})(jQuery);

