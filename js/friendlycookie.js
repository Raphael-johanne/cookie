/*!
 * Copyright(c) Raphael Colboc
 * MIT Licensed
 **/

const ulContainerId = "#cookies_list";
const notificationContainerId = "#notification";
const suffixCookie = "__DISABLE";
const cookieStorage = chrome.cookies;

let currentValueEdition = false;

$(document).ready(function() {
	
	chrome.tabs.getSelected(null, function(tab){

		const url = new URL(tab.url)
		const domainName = url.protocol + '//' + url.hostname;

		loadList(domainName);

		info('You can edit <b>value</b> of a cookie directly <b>on click on the value field</b> of the cookie table below. You can also <b>remove</b> or <b>Enable/Disable</b> cookies with action links.');

		$('#cookie_save').click(function(){
			if ($('#cookie_name').val() == "" || $('#cookie_value').val() == "") {
				error('You must set a correct cookie name and cookie value.');
			} else {
				success('The cookie "<b>' +  $('#cookie_name').val() + '</b>" has been created successfully.');
				createCookie(domainName, $('#cookie_name').val(), $('#cookie_value').val());
				loadList(domainName);
			}
		});
	});
});

/**
* load list of cookies
**/
function loadList(domainName) {
	$("table tbody").empty();
	currentValueEdition = false;
	getCookies(domainName, function(cookies){
		$.each(cookies.reverse(), function(index, cookie) {
			createItem(
				domainName, 
				cookie.name, 
				cookie.value
			);
		});
	});
};

/**
* create tr items and bind dom behaviour on each links
**/
function createItem(domainName, cookieName, cookieValue) {
	const tr = $('<tr>');
	const isDisable = cookieName.indexOf(suffixCookie) != -1;
	const removeLink = $('<a/>').attr('class', 'action remove-cookie');
	const availibilityLink = $('<a/>').attr('class', isDisable ? 'action disable-cookie' : 'action enable-cookie');

	removeLink.click(function(){
		if (confirm("Are you sure that you want to remove this Cookie : " + cookieName.replace(suffixCookie, "") + " ?") == true) {
			success('The cookie "<b>' + cookieName.replace(suffixCookie, "") + '</b>" has been removed.');
    		removeCookie(domainName, cookieName);
		} 
	});
	
	availibilityLink.click(function(){
		if (isDisable) {
			success('The cookie "<b>' + cookieName.replace(suffixCookie, "") + '</b>" is now enable.');
			enableCookie(domainName, cookieName);
		} else {
			warning('The cookie "<b>' + cookieName + '</b>" is now disable.');
			disableCookie(domainName, cookieName);
		}
		loadList(domainName);
	});

	const tdValueContent = $('<a/>').attr('title', 'Click to edit the value : "' + cookieValue + '".').append(cookieValue.substring(0,20));
	const tdName = $('<td>').append(cookieName.replace(suffixCookie, "").substring(0,20));
	const tdValue = $('<td>').append(tdValueContent);
	const tdRemove = $('<td>').append(removeLink);
	const tdAvailibility = $('<td>').append(availibilityLink);
	
	tdValueContent.click(function(){
		if (currentValueEdition === false) {
			currentValueEdition = true;
			$(this).remove();

			const editValueInput = $("<input type='text'/>").val(cookieValue);

			$(editValueInput).blur(function() {
				success('The cookie value of "' + cookieName.replace(suffixCookie, "") + '" has been updated.');
				currentValueEdition = false;
				editValueCookie(domainName, cookieName, editValueInput.val());
				loadList(domainName);
			});

			$(tdValue).append(editValueInput);
		} else {
			error("You cannot edit the values of two cookies at the same time.");
		}
	});

	tr.append(tdName);
	tr.append(tdValue);
	tr.append(tdRemove);
	tr.append(tdAvailibility);

	$('table').append(tr);    
};

/**
* create a cookie
**/
function createCookie(domainName, cookieName, cookieValue) {
	cookieStorage.set({"url":domainName, "name" : cookieName, "value" : cookieValue});
};

/**
* edit cookie by rename it
**/
function editValueCookie(domainName, cookieName, value) {
	getCookie(domainName, cookieName, function(cookie) {
		removeCookie(domainName, cookieName);
		createCookie(domainName, cookieName, value);
	});
};

/**
* disable cookie by rename it
**/
function disableCookie(domainName, cookieName) {
	getCookie(domainName, cookieName, function(cookie) {
		createCookie(domainName, cookieName + suffixCookie, cookie.value);
		removeCookie(domainName, cookieName);
	});
};

/**
* enable cookie by rename it
**/
function enableCookie(domainName, cookieName) {
	getCookie(domainName, cookieName, function(cookie) {
		const newCookie = cookie.name.replace(suffixCookie, "");
		createCookie(domainName, newCookie, cookie.value);
		removeCookie(domainName, cookieName);
	});
};

/**
* remove cookie by key
**/
function removeCookie(domainName, cookieName) {
	return cookieStorage.remove({"url":domainName, "name" : cookieName}, function (removed) {
	 	loadList(domainName);
	});
};

/**
* get cookies for current domain
**/
function getCookies(domainName, callback) {
	return cookieStorage.getAll({"url":domainName}, callback);
};

/**
* get cookie by key
**/
function getCookie(domainName, cookieName, callback) {
	return cookieStorage.get({"url":domainName, "name" : cookieName}, callback);
};

/**
* message
**/
function message(type, content) {
	const notificationElement = $(notificationContainerId);
	notificationElement.empty(); 
	notificationElement.append($('<p/>').attr('class', type).html(content)); 
	$('html, body').animate({
        scrollTop: notificationElement.offset().top
    }, 1000);
};

/**
* add error message
**/
function error(content) {
	message('error', "<strong>Error</strong> : " + content);
};

/**
* add success message
**/
function success(content) {
	message('success', "<strong>Success</strong> : " +  content);
};

/**
* add info message
**/
function info(content) {
	message('info', "<strong>Info</strong> : " + content);
};

/**
* add warning message
**/
function warning(content) {
	message('warning', "<strong>Warning</strong> : " + content);
};

/**
* debug
**/
function dump(data) {
	alert(JSON.stringify(data));
};
