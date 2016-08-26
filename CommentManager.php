<?php

class CommentManager {
	const DB_HOST = "localhost";
	const DB_USER = "root";
	const DB_PASSWORD = "";
	const DB_NAME = "comments";

	private $conn;

	function __construct() {
		$this->conn = new mysqli(self::DB_HOST, self::DB_USER, self::DB_PASSWORD, self::DB_NAME);
		$this->conn->set_charset("utf8");
		if (mysqli_connect_errno()) {
			throw new DbException(mysqli_connect_error());
		}
	}

	function get($a) {
		extract($a);
		$stmt = $this->conn->prepare("SELECT id, nickname, content, parent_id, DATE_FORMAT(added, \"%m.%d.%Y в %H:%i\") AS added FROM comments WHERE UNIX_TIMESTAMP(added) > ?");
		$stmt->bind_param("i", $lastUpdate);
		$stmt->execute();
		$r = $stmt->get_result();
		if (isset($removed)) {
			$stmt1 = $this->conn->prepare("SELECT comment_id AS id FROM removed_comments WHERE UNIX_TIMESTAMP(removed) > ?");
			$stmt1->bind_param("i", $lastUpdate);
			$stmt1->execute();
			$r1 = $stmt1->get_result();
			return array("added" => $r->fetch_all(MYSQLI_ASSOC), "removed" => $r1->fetch_all(MYSQLI_ASSOC), "lastUpdate" => time());
		}
		return array("added" => $r->fetch_all(MYSQLI_ASSOC), "lastUpdate" => time());
	}

	function add($a) {
		extract($a);
		$stmt = $this->conn->prepare("INSERT INTO comments (nickname, content, added, parent_id) VALUES (?, ?, NOW(), ?)");
		$stmt->bind_param("ssi", $nickname, $content, isset($parent_id) ? $parent_id : null);
		$stmt->execute();
		if ($stmt->errno) {
			throw new DbException();
		} else {
			return array("id" => $stmt->insert_id, "nickname" => $nickname, "content" => $content, "added" => date("m.d.Y в H:i"), "parent_id" => isset($parent_id) ? $parent_id : null);
		}
	}

	function remove($a) {
		extract($a);
		$stmt = $this->conn->prepare("DELETE FROM comments WHERE id=?");
		$stmt->bind_param("i", $comment_id);
		$stmt->execute();
		$stmt1 = $this->conn->prepare("INSERT INTO removed_comments (comment_id, removed) VALUES (?, NOW())");
		$stmt1->bind_param("i", $comment_id);
		$stmt1->execute();
		if ($stmt->errno || $stmt1->errno) {
			throw new DbException($stmt->error);
		} else {
			return array("qq" => "123");
		}
	}
}