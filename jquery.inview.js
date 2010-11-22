/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 */
(function ($) {
    function getViewportHeight() {
        var height = window.innerHeight; // Safari, Opera
        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight (which has the wrong value).
        if (height) { return height; }
        var mode = document.compatMode;

        if (mode || !$.support.boxModel) { // IE, Gecko
            height = mode == 'CSS1Compat' ?
            document.documentElement.clientHeight : // Standards
            document.body.clientHeight; // Quirks
        }

        return height;
    }
    
    function offsetTop(debug) {
        // Manually calculate offset rather than using jQuery's offset
        // This works-around iOS < 4 on iPad giving incorrect value
        // cf http://bugs.jquery.com/ticket/6446#comment:9
        var curTop = 0;
        for (var obj = debug; obj !== null; obj = obj.offsetParent) {
            curTop += obj.offsetTop;
        }
        return curTop;
    }

    function checkInView() {
        var vpH = getViewportHeight(),
            scrollTop = (window.pageYOffset ?
                window.pageYOffset : 
                document.documentElement.scrollTop ?
                document.documentElement.scrollTop :
                document.body.scrollTop),
            elems = [];
        
        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function () {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });
        
        if (elems.length) {
            $(elems).each(function () {
                var $el = $(this),
                    top = offsetTop(this),
                    height = $el.height(),
                    inview = $el.data('inview') || false;

                if (scrollTop > (top + height) || scrollTop + vpH < top) {
                    if (inview) {
                        $el.data('inview', false);
                        $el.trigger('inview', [false]);                        
                    }
                } else if (scrollTop < (top + height)) {
                    var visPart = (scrollTop > top ? 'bottom' : (scrollTop + vpH) < (top + height) ? 'top' : 'both');
                    if (!inview || inview !== visPart) {
                        $el.data('inview', visPart);
                        $el.trigger('inview', [true, visPart]);
                    }
                }
            });
        }
    }
    
    // Use setInterval in order to also make sure this captures elements within
    // "overflow:scroll" elements
    // old:
    // $(window).scroll(checkInView);
    setInterval(checkInView, 250);
})(jQuery);
