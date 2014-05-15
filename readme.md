
# custom-select bsp utility

... `custom-select.html` is a working demo; so look at that, first.

CSS provided has optional rules & required rules (this needs to be specified).

------------------------------------------------------------------------------------------------------------------------------

The JavaScript to instantiate the plugin looks like this:

    $(".custom-select").customSelect({"debug":true});

------------------------------------------------------------------------------------------------------------------------------

There are a few options you can specify:

        {
            debug: false,
            icons: {
                "open":  "fa-chevron-down",
                "close": "fa-chevron-up"
            }
        }

"open" & "close" are for CSS classNames that get used to indicate the open or closed state of the dropdown.

The sample files use classes that correspond to Font Awesome.

------------------------------------------------------------------------------------------------------------------------------

There are also some public methods you can access, for example to be able to add arbitrary <option>s, use the `.add` method:

    var $customSelectAdderDemo = $(".custom-select-adder-demo").customSelect().data("customSelect");

    $customSelectAdderDemo.add( $adder.find('[name="_text"]').val(), $adder.find('[name="_value"]').val() );

To be able to replace all <option>s, use the `.replaceOptions` method:

    var $customSelectReplaceDemo = $(".custom-select-replace-demo").customSelect().data("customSelect");

    $customSelectReplaceDemo.replaceOptions(
        [{
            "_value" : "America/Puerto_Rico",
            "_text"  : "Puerto Rico (Atlantic)"
        }, {
            "_value" : "Pacific/Honolulu",
            "_text"  : "Honolulu (Hawaii)"
        }]
    );

In the previous example, you could append a set of options by calling `addOptions` instead of `replaceOptions`.

------------------------------------------------------------------------------------------------------------------------------

