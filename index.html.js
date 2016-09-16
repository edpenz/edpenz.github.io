$(document).ready(replaceTitleExitAnimation);
$(window).resize(replaceTitleExitAnimation);

// Replaces title's generic slide-and-fade with a position tween
function replaceTitleExitAnimation() {
  var fromElement = $('main .site-title')[0];
  var toElement = $('.page-nav .site-title')[0];

  var fromBounds = fromElement.getBoundingClientRect();
  var toBounds = toElement.getBoundingClientRect();

  var translateX = toBounds.left - fromBounds.left;
  var translateY = toBounds.top - fromBounds.top;

  var scaleX = toBounds.width / fromBounds.width;
  var scaleY = toBounds.height / fromBounds.height;

  jss.set('.anim-exit .layout-landing main', {
    'transform': 'translateX('+translateX+'px)'
  });
  jss.set('.anim-exit .layout-landing main .site-title', {
    'transform': 'translateY('+translateY+'px) scale('+scaleY+')'
  });
}
