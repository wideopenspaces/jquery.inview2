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
    
    // This method might fix problems on the iPad but therefore fails with elements within
    // overflow: scroll; elements
    //
    // function getElementOffset(debug) {
    //     // Manually calculate offset rather than using jQuery's offset
    //     // This works-around iOS < 4 on iPad giving incorrect value
    //     // cf http://bugs.jquery.com/ticket/6446#comment:9
    //     var obj, offset = { top: 0, left: 0 };
    //     for (obj = debug; obj !== null; obj = obj.offsetParent) {
    //         offset.top  += obj.offsetTop;
    //         offset.left += obj.offsetLeft;
    //     }
    //     return offset;
    // }

    function checkInView() {
        var viewport, scrollTop, scrollLeft, elems = [];
        
        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function() {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });
        
        if (elems.length) {
            viewportSize   = getViewportSize();
            viewportOffset = getViewportOffset();

            $(elems).each(function() {
                // Ignore elements that are not in the DOM tree
                if (!$.contains(document.documentElement, this)) {
                  return;
                }
                
                var $el           = $(this),
                    elementSize   = { height: $el.height(), width: $el.width() },
                    elementOffset = $el.offset(),
                    inView        = $el.data('inview'),
                    visiblePartY,
                    visiblePartX,
                    visiblePartsMerged;
                
                if (elementOffset.top + elementSize.height > elementOffset.top &&
                    elementOffset.top < viewportOffset.top + viewportSize.height &&
                    elementOffset.left + elementSize.width > viewportOffset.left &&
                    elementOffset.left < viewportOffset.left + viewportSize.width) {
                    visiblePartY = (viewportOffset.top > elementOffset.top ?
                        'bottom' : (viewportOffset.top + viewportSize.height) < (elementOffset.top + elementSize.height) ?
                        'top' : 'both');
                    visiblePartX = (viewportOffset.left > elementOffset.left ?
                        'right' : (viewportOffset.left + viewportSize.width) < (elementOffset.left + elementSize.width) ?
                        'left' : 'both');
                    visiblePartsMerged = visiblePartX + "-" + visiblePartY;
                    if (!inView || inView !== visiblePartsMerged) {
                        $el.data('inview', visiblePartsMerged).trigger('inview', [true, visiblePartX, visiblePartY]);
                    }
                } else if (inView) {
                  $el.data('inview', false).trigger('inview', [false]);                        
                }
            });
        }
    }
    
    // Use setInterval in order to also make sure this captures elements within
    // "overflow:scroll" elements or elements that appeared in the dom tree due to
    // dom manipulation and reflow
    // old:
    // $(window).scroll(checkInView);
    setInterval(checkInView, 250);
})(jQuery);
