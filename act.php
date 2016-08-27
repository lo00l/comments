<?php
	error_reporting(0);
	require_once("DbException.php");
	require_once("CommentManager.php");

	try {
		$manager = new CommentManager();
		$result = $manager->{$_REQUEST['act']}($_REQUEST);
		echo json_encode($result);
	} catch (DbException $e) {
		echo json_encode(array("error" => "Ошибка: " . $e->getMessage()));
	}
	
	