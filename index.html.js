$(function() {
  // At page load adjust the exit animation to properly align the titles
  var fromElement = $('main .site-title')[0];
  var toElement = $('.page-nav .site-title')[0];

  var fromBounds = fromElement.getBoundingClientRect();
  var toBounds = toElement.getBoundingClientRect();

  var translateX = toBounds.left - fromBounds.left;
  var translateY = toBounds.top - fromBounds.top;

  var scaleX = toBounds.width / fromBounds.width;
  var scaleY = toBounds.height / fromBounds.height;

  jss.set('.anim-exit .layout-landing', {
    'transform': 'translateX('+translateX+'px)'
  });
  jss.set('.anim-exit .layout-landing .site-title', {
    'transform': 'translateY('+translateY+'px) scale('+scaleY+')'
  });
});
