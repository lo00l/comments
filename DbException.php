<?php

class DbException extends Exception {
	function __construct($message) {
		$this->message = $message;
	}
}