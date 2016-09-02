/**
 * smoothState initialisation
 */
$(function() {
  var smoothStateRoot = $('#smoothstate-root');

  var exitOptions = {
    duration: 300,
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
    smoothStateRoot.smoothState().data('smoothState').restartCSSAnimations();
    $('body').removeClass('anim anim-enter');
  }

  function setOptions($options, $config) {
    $options.duration = $config.duration || 0;
  }

  // Init smoothState with default options
  smoothStateRoot.smoothState({
    onStart: exitOptions,
    onReady: enterOptions
  });
});
