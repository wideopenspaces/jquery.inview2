/**
 * author Christopher Blum
 *    - based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 *    - forked from http://github.com/zuk/jquery.inview/
 */
(function ($) {
    function getViewportSize() {
        var mode, domObject, size = { height: window.innerHeight, width: window.innerWidth };

        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight/clientWidth (which has the wrong value).
        if (!size.height) {
            mode = document.compatMode;
            if (mode || !$.support.boxModel) { // IE, Gecko
                domObject = mode == 'CSS1Compat' ?
                    document.documentElement : // Standards
                    document.body; // Quirks
                size = {
                    height: domObject.clientHeight,
                    width:  domObject.clientWidth
                };
            }
        }

        return size;
    }

    function getViewportOffset() {
        return {
            top:  window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
            left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
        };
    }

    function getElementSize($elem) {
        return {
            height: $elem.height(),
            width:  $elem.width()
        };
    }

    function checkInView() {
        var elems = [], elemsLength, i=0;

        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function() {
            if (this.events && this.events.inview) {
                if (this.events.live) {
                    var context = $(this.handle.elem);
                    $.each(this.events.live, function() {
                      elems = elems.concat(context.find(this.selector).toArray());
                    });
                } else {
                    elems.push(this.handle.elem);
                }
            }
        });
        
        
        elemsLength = elems.length;
        if (elemsLength) {
            viewportSize   = getViewportSize();
            viewportOffset = getViewportOffset();

            for (; i<elemsLength; i++) {
                // Ignore elements that are not in the DOM tree
                if (!$.contains(document.documentElement, elems[i])) {
                  continue;
                }

                var $el           = $(elems[i]),
                    elementSize   = { height: $el.height(), width: $el.width() },
                    elementOffset = $el.offset(),
                    inView        = $el.data('inview'),
                    visiblePartX,
                    visiblePartY,
                    visiblePartsMerged;

                if (elementOffset.top + elementSize.height > elementOffset.top &&
                    elementOffset.top < viewportOffset.top + viewportSize.height &&
                    elementOffset.left + elementSize.width > viewportOffset.left &&
                    elementOffset.left < viewportOffset.left + viewportSize.width) {
                    visiblePartX = (viewportOffset.left > elementOffset.left ?
                        'right' : (viewportOffset.left + viewportSize.width) < (elementOffset.left + elementSize.width) ?
                        'left' : 'both');
                    visiblePartY = (viewportOffset.top > elementOffset.top ?
                        'bottom' : (viewportOffset.top + viewportSize.height) < (elementOffset.top + elementSize.height) ?
                        'top' : 'both');
                    visiblePartsMerged = visiblePartX + "-" + visiblePartY;
                    if (!inView || inView !== visiblePartsMerged) {
                        $el.data('inview', visiblePartsMerged).trigger('inview', [true, visiblePartX, visiblePartY]);
                    }
                } else if (inView) {
                  $el.data('inview', false).trigger('inview', [false]);
                }
            };
        }
    }

    // Use setInterval in order to also make sure this captures elements within
    // "overflow:scroll" elements or elements that appeared in the dom tree due to
    // dom manipulation and reflow
    // old:
    // $(window).scroll(checkInView);
    setInterval(checkInView, 250);
})(jQuery);
