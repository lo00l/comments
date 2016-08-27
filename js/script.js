var commentTemplate = _.template('<div class="media" id="comment<%= id %>"><div class="media-left"><img alt="64x64" class="media-object" src="img/placeholder.png"></div><div class="media-body"><h4 class="media-heading"><%= nickname %> <small><%= added %> <span class="glyphicon glyphicon-remove remove" onClick="removeComment(<%= id %>)"></span></small> </h4><p><%= content %></p><p class="button-holder"><button class="btn btn-primary btn-sm" onClick="showAnswerForm(<%= id %>)">Ответить</button></p></div></div>');
var formTemplate = _.template('<p><form class="reply-form" id="reply<%= parent_id %>"><div class="form-group"><label for="nickname">Ваше имя</label><input type="text" class="form-control" name="nickname" placeholder="Имя"></div><div class="form-group"><label for="content">Ваше сообщение</label><textarea class="form-control" name="content" placeholder="Сообщение"></textarea></div><input type="hidden" name="parent_id" value="<%= parent_id %>" /><input type="hidden" name="act" value="add" /><button type="submit" class="btn btn-default">Отправить</button><img src="img/loading.gif" style="display: none; height: 64px"></form></p>');
lastUpdate = 0;

function addComment(comment) {
	if ($("#comment" + comment['id']).length > 0) {
		return;
	}
	if (comment['parent_id']) {
		$("#comment" + comment['parent_id'] + ">.media-body").append(commentTemplate(comment));
	} else {
		$("#comments").append(commentTemplate(comment));
	}
}

function showAnswerForm(commentId) {
	if ($("#reply" + commentId).length > 0) {
		return;
	}
	$("#comment" + commentId + ">.media-body>.button-holder button").addClass("disabled");
	$("#comment" + commentId + ">.media-body>.button-holder").after(formTemplate({parent_id: commentId}));
	$("#reply" + commentId).submit(function(e) {
		$.ajax({
			url: "act.php",
			method: "POST",
			dataType: "json",
			data: $("#reply" + commentId).serialize(),
			beforeSend: function() {
				$("#reply" + commentId + " button").hide();
				$("#reply" + commentId + " img").show();
			},
			success: function(data) {
				if (!data['error']) {
					addComment(data);
					$("#reply" + commentId).slideUp({complete: function() {
						$(this).remove();
					}});
					$("#comment" + commentId + ">.media-body>.button-holder button").removeClass("disabled");
				} else {
					alert(data['error']);
				}
			}
		});
		e.preventDefault();
	});
	$("#reply" + commentId).slideDown();
}

function getComments(beforeSend, success, removed) {
	$.ajax({
		url: "act.php",
		method: "POST",
		dataType: "json",
		data: {act: "get", lastUpdate: lastUpdate, removed: removed},
		beforeSend: beforeSend,
		success: function(data) {
			if (!data['error']) {
				lastUpdate = data['lastUpdate'];
				success(data);
			} else {
				alert(data['error']);
			}
		}
	});
}

function removeComment(commentId) {
	$.ajax({
		url: "act.php",
		method: "POST",
		dataType: "json",
		data: {act: "remove", comment_id: commentId},
		success: function(data) {
			if (!data['error']) {
				$("#comment" + commentId).slideUp({complete: function() {
					$(this).remove();
				}});
			} else {
				alert(data['error']);
			}
		}
	});
}

$(document).ready(function() {
	getComments(
		function() {
			$(".loading").show();
		},
		function(data) {
			$(".loading").hide();
			_.each(data['added'], function(comment) {
				addComment(comment);
			});
		});
	$("#add-comment").submit(function(e) {
		$.ajax({
			url: "act.php",
			method: "POST",
			dataType: "json",
			data: $("#add-comment").serialize(),
			beforeSend: function() {
				$("#add-comment button").hide();
				$("#add-comment img").show();
			},
			success: function(data) {
				if (!data['error']) {
					addComment(data);
					$("#add-comment img").hide();
					$("#add-comment button").show();
				} else {
					alert(data['error']);
				}
			}
		});
		e.preventDefault();
	});
	setInterval(function() {
		getComments(function() {}, function(data) {
			_.each(data['added'], function(comment) {
				addComment(comment);
			});
			_.each(data['removed'], function(comment) {
				$("#comment" + comment['id']).remove();
			});
		}, true)
		}, 5000);
});