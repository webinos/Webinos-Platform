//  scripts for mobile version

function checkwidth() {
	if($(window).width() < 1200) {
		return true;
	} else {
		return false;
	}
}

function loginMobileImprove() {
	if(checkwidth()) {
		$("div.module_content").css('margin','0');
		$("body").css('background','url(images/testbed_bg2.png) no-repeat');
		$(".btnlogin").css('float','none');
		$(".btnlogin").css('display','block');
		$(".btnlogin").css('margin-top','5px');
	}
}

function fileMobileImprove() {
	if(checkwidth()) {
		$("body").css('background','url(images/testbed_bg2.png) no-repeat');
		$("table#right, table#left").css('float','none');
		$("table#right, table#left").css('display','none');
		$("table#right, table#left").css('visibility','visible');
	}
}

function authMobileImprove() {
	if(checkwidth()) {
		$("table, tr, td").css('border-width','0');
	}
}

// this tells jquery to run the function below once the DOM is ready
$(document).ready(function() {

	if(checkwidth()) {

		if($('#mainPageGuide')) {
			$('#mainPageGuide').text('Please select one of the actions on the menu');
		}

		//menu part
		// initialise the visibility check
		var is_visible = false;

		// capture clicks on menu link
		$('#foldingBtn').click(function() {
			// switch visibility
			is_visible = !is_visible;

			// change the link text depending on whether the element is shown or hidden
			if($('#sidebar').css('display') == 'block') {
				$('#sidebar').slideUp('slow');
			} else {
				$('#sidebar').slideDown('slow');
			}

			// return false so any link destination is not followed
			return false;
		});

		// capture clicks on all links inside menu
		$('#sidebar a').not('a.toggleLink').click(function() {
			// switch visibility
			is_visible = !is_visible;

			// hides menu
			$('#sidebar').slideUp('slow');
		});
	}

});
