<?php
$file_path = "finaldummy.py";

$command = escapeshellcmd("python " . $file_path);
$output = shell_exec($command);

echo "<pre>$output</pre>";
?>
