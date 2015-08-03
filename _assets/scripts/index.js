(function() {
	var $buttons = $('.button');
	var $button = $buttons.last();
	var $wrapper = $('.field-wrapper');
	var $username = $wrapper.find('input');
	$button.bind('click', function() {
		$buttons.addClass('fade');
		$wrapper.addClass('show');
	});
	$username.bind('focusout', function() {
		$username.val('');
	});
})();