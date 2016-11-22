// smoothState initialisation
$(function () {
  var smoothStateRoot = $('#smoothstate-root');

  var exitOptions = {
    duration: 400,
    render: handlePageExit,

    class: 'anim-exit'
  }

  var enterOptions = {
    render: handlePageEnter,

    class: 'anim-enter'
  }

  function handlePageExit($container) {
    setOptions(exitOptions, smoothstatePageConfig);

    $('body').addClass('anim anim-exit');
  }

  function handlePageEnter($container, $newContent) {
    $('body').removeClass('anim anim-exit');

    $container.html($newContent);
    setOptions(enterOptions, smoothstatePageConfig);

    $('body').addClass('anim anim-enter');
    window.scrollTo(0, 0);
    smoothStateRoot.smoothState().data('smoothState').restartCSSAnimations();
    $('body').removeClass('anim anim-enter');
  }

  function setOptions($options, $config) {
    $options.duration = $config.duration || 400;
  }

  // Init smoothState with default options
  smoothStateRoot.smoothState({
    onStart: exitOptions,
    onReady: enterOptions,
    repeatDelay: 0
  });
});


// Replaces landing page logo's generic slide-and-fade animation with a position/scale tween
function replaceTitleExitAnimation() {
  var fromElement = $('main .site-title')[0];
  var toElement = $('.page-nav .site-title')[0];

  if (!fromElement || !toElement) return;

  var fromBounds = fromElement.getBoundingClientRect();
  var toBounds = toElement.getBoundingClientRect();

  var translateX = toBounds.left - fromBounds.left;
  var translateY = toBounds.top - fromBounds.top;

  var scaleX = toBounds.width / fromBounds.width;
  var scaleY = toBounds.height / fromBounds.height;

  jss.set('.anim-exit .layout-landing main', {
    'transform': 'translateX(' + translateX + 'px)'
  });
  jss.set('.anim-exit .layout-landing main .site-title', {
    'transform': 'translateY(' + translateY + 'px) scale(' + scaleY + ')'
  });
}

$(document).ready(replaceTitleExitAnimation);
$(window).resize(replaceTitleExitAnimation);
