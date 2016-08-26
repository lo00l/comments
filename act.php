<?php
	require_once("DbException.php");
	require_once("CommentManager.php");

	try {
		$manager = new CommentManager();
		$result = $manager->{$_REQUEST['act']}($_REQUEST);
	} catch (DbException $e) {
		echo "Ошибка: " . $e->getMessage();
	}
	echo json_encode($result);
	